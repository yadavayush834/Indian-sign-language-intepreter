import os
import pickle
import threading
from pathlib import Path

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision

MODEL_DIR = Path(os.getenv('MODEL_DIR', Path(__file__).resolve().parents[2]))
LANDMARK_MODEL_PATH = MODEL_DIR / 'landmark_rf_model.pkl'
LANDMARKER_PATH = MODEL_DIR / 'hand_landmarker.task'

MODEL_NAME = 'LANDMARK_RF'

predict_lock = threading.Lock()


def _validate_files() -> None:
    needed = [LANDMARK_MODEL_PATH, LANDMARKER_PATH]
    missing = [str(path) for path in needed if not path.exists()]
    if missing:
        raise RuntimeError(f'Missing model assets: {missing}. Set MODEL_DIR to correct folder.')


def _load_model_and_detector():
    _validate_files()

    with open(LANDMARK_MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    base_options = mp_python.BaseOptions(model_asset_path=str(LANDMARKER_PATH))
    options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
    detector = vision.HandLandmarker.create_from_options(options)

    return model, detector


model, detector = _load_model_and_detector()


def extract_normalized_features(hand_landmarks_list):
    final_features = []
    for hand_landmarks in hand_landmarks_list:
        wrist_x = hand_landmarks[0].x
        wrist_y = hand_landmarks[0].y
        wrist_z = hand_landmarks[0].z

        raw_coords = []
        for lm in hand_landmarks:
            raw_coords.extend([lm.x - wrist_x, lm.y - wrist_y, lm.z - wrist_z])

        max_val = max(abs(val) for val in raw_coords)
        if max_val > 0.0:
            final_features.extend([val / max_val for val in raw_coords])
        else:
            final_features.extend(raw_coords)

    # 42 points (2 hands) * xyz = 126 features
    while len(final_features) < 126:
        final_features.append(0.0)

    return final_features[:126]

app = FastAPI(title='ISL Interpreter Inference API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/predict')
async def predict(
    image: UploadFile = File(...),
    threshold: float = Form(0.5)
):
    image_bytes = await image.read()
    np_bytes = np.frombuffer(image_bytes, dtype=np.uint8)
    bgr_frame = cv2.imdecode(np_bytes, cv2.IMREAD_COLOR)

    if bgr_frame is None:
        raise HTTPException(status_code=400, detail='Invalid image payload')

    bgr_frame = cv2.flip(bgr_frame, 1)
    rgb_frame = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

    with predict_lock:
        results = detector.detect(mp_image)

        if not results.hand_landmarks:
            return {
                'mode': MODEL_NAME,
                'handDetected': False,
                'label': '',
                'confidence': 0.0,
                'accepted': False
            }

        features = extract_normalized_features(results.hand_landmarks)
        input_data = np.array(features, dtype=np.float32).reshape(1, -1)

        if hasattr(model, 'predict_proba'):
            prob = model.predict_proba(input_data)[0]
            idx = int(np.argmax(prob))
            conf = float(prob[idx])
            label = str(model.classes_[idx])
        else:
            label = str(model.predict(input_data)[0])
            conf = 1.0

    return {
        'mode': MODEL_NAME,
        'handDetected': True,
        'label': label,
        'confidence': round(conf, 5),
        'accepted': conf >= threshold
    }

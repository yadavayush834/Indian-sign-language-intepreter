import os
import pickle
import threading
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
from groq import Groq
import tensorflow as tf
import json
from typing import List

MODEL_DIR = Path(os.getenv('MODEL_DIR', Path(__file__).resolve().parents[2]))
LANDMARK_MODEL_PATH = MODEL_DIR / 'landmark_rf_model.pkl'
LANDMARKER_PATH = MODEL_DIR / 'hand_landmarker.task'
DYNAMIC_MODEL_PATH = MODEL_DIR / 'sequence_model.keras'
DYNAMIC_LABELS_PATH = MODEL_DIR / 'sequence_labels.txt'

MODEL_NAME = 'LANDMARK_RF'
DYNAMIC_MODEL_NAME = 'DYNAMIC_LSTM'

predict_lock = threading.Lock()


def _validate_files() -> None:
    needed = [LANDMARK_MODEL_PATH, LANDMARKER_PATH]
    missing = [str(path) for path in needed if not path.exists()]
    if missing:
        raise RuntimeError(f'Missing model assets: {missing}. Set MODEL_DIR to correct folder.')


def _load_model_and_detector():
    _validate_files()

    # Load Static RF Model
    with open(LANDMARK_MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    # Load Dynamic LSTM Model (Optional)
    dynamic_model = None
    dynamic_labels = []
    if DYNAMIC_MODEL_PATH.exists():
        try:
            dynamic_model = tf.keras.models.load_model(str(DYNAMIC_MODEL_PATH))
            if DYNAMIC_LABELS_PATH.exists():
                with open(DYNAMIC_LABELS_PATH, 'r') as f:
                    dynamic_labels = [line.strip() for line in f.readlines()]
            print(f"[Backend] Dynamic model loaded with {len(dynamic_labels)} classes.")
        except Exception as e:
            print(f"[Backend] Error loading dynamic model: {e}")

    base_options = mp_python.BaseOptions(model_asset_path=str(LANDMARKER_PATH))
    options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
    detector = vision.HandLandmarker.create_from_options(options)

    return model, detector, dynamic_model, dynamic_labels


model, detector, dynamic_model, dynamic_labels = _load_model_and_detector()

# Groq Configuration
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_KEY_CORRECTION = os.getenv('GROQ_API_KEY_CORRECTION', GROQ_API_KEY)
GROQ_API_KEY_REFINE = os.getenv('GROQ_API_KEY_REFINE', GROQ_API_KEY)

def get_groq_client(api_key):
    if api_key:
        return Groq(api_key=api_key)
    return None

groq_client = get_groq_client(GROQ_API_KEY)
groq_client_correction = get_groq_client(GROQ_API_KEY_CORRECTION)
groq_client_refine = get_groq_client(GROQ_API_KEY_REFINE)

if groq_client:
    print("[Groq] Clients initialized successfully.")
else:
    print("[Groq] WARNING: Primary API Key missing.")


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
        'accepted': conf >= threshold,
        'landmarks': features
    }


@app.post('/predict_sequence')
async def predict_sequence(
    sequences: str = Form(...),  # JSON string of landmarks
    threshold: float = Form(0.7)
):
    """
    Expects a JSON string representing a list of 30 frame feature vectors.
    Each frame feature vector should be a list of 126 floats.
    """
    if dynamic_model is None:
        return {'error': 'Dynamic model not loaded on server'}

    try:
        data = json.loads(sequences)
        # Expected shape: (30, 126)
        input_data = np.array(data, dtype=np.float32)
        
        if input_data.shape != (30, 126):
            return {'error': f'Invalid sequence shape: {input_data.shape}, expected (30, 126)'}

        # Add batch dimension: (1, 30, 126)
        input_data = input_data.reshape(1, 30, 126)
        
        with predict_lock:
            predictions = dynamic_model.predict(input_data, verbose=0)
            idx = int(np.argmax(predictions[0]))
            conf = float(predictions[0][idx])
            
            label = dynamic_labels[idx] if idx < len(dynamic_labels) else "Unknown"

        return {
            'mode': DYNAMIC_MODEL_NAME,
            'label': label,
            'confidence': round(conf, 5),
            'accepted': conf >= threshold
        }

    except Exception as e:
        print(f"[predict_sequence] Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post('/suggest')
async def suggest(
    transcript: str = Form(''),
    currentWord: str = Form('')
):
    print(f"[Suggest Request] transcript='{transcript}', currentWord='{currentWord}'")
    if not GROQ_API_KEY:
        print("[Suggest] Error: GROQ_API_KEY is missing")
        return {'suggestions': []}

    prompt = (
        f"You are helping a person signing in Indian Sign Language. "
        f"Current transcript: '{transcript}'. "
        f"Currently building word: '{currentWord}'. "
        "Predict exactly 3 small words (one or two syllables max) that could come next or complete the current word. "
        "Return ONLY a comma-separated list of 3 words. No sentences. No descriptions. "
        "Example: 'apple, apply, appear'"
    )

    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=32,
        )
        
        text = completion.choices[0].message.content.strip()
        print(f"[Suggest] Raw response: {text}")
        suggestions = [s.strip() for s in text.split(',')]
        # Filter to ensure we only have 3 words and no weird formatting
        suggestions = [s.replace('"', '').replace("'", "").split('\n')[0] for s in suggestions]
        print(f"[Suggest] Filtered: {suggestions[:3]}")
        return {'suggestions': suggestions[:3]}
        
    except Exception as e:
        print(f"[Groq Error] {e}")
        return {'suggestions': [], 'error': str(e)}


@app.post('/correct')
async def correct(
    currentWord: str = Form('')
):
    if not groq_client_correction or not currentWord:
        return {'suggestions': []}

    prompt = (
        f"The user is signing letters and built the word: '{currentWord}'. "
        "If it is misspelled, suggest the correct word. If it is incomplete, suggest 3 possible completions. "
        "Return ONLY a comma-separated list of 3 words. No descriptions."
    )

    try:
        completion = groq_client_correction.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=32,
        )
        text = completion.choices[0].message.content.strip()
        suggestions = [s.strip().replace('"', '').replace("'", "") for s in text.split(',')]
        return {'suggestions': suggestions[:3]}
    except Exception as e:
        return {'suggestions': [], 'error': str(e)}


@app.post('/refine')
async def refine(
    transcript: str = Form('')
):
    if not groq_client_refine or not transcript:
        return {'refined': transcript}

    prompt = (
        "You are an expert translator for Indian Sign Language. "
        f"The following is a fragmented transcript of signs: '{transcript}'. "
        "Convert this into a single, coherent, and grammatically correct English sentence. "
        "Keep the meaning identical but fix the flow. "
        "Return ONLY the refined sentence. No explanations."
    )

    try:
        completion = groq_client_refine.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5,
            max_tokens=64,
        )
        refined = completion.choices[0].message.content.strip()
        return {'refined': refined}
    except Exception as e:
        return {'refined': transcript, 'error': str(e)}

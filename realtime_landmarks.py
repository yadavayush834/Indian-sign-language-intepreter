import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import os
import pickle

MODEL_FILE = 'landmark_rf_model.pkl'

print("Initializing Dual-Hand Real-Time Inference...")

if not os.path.exists(MODEL_FILE):
    print(f"Error: {MODEL_FILE} not found. You must run collect_data.py and then train_model.py first!")
    exit()

with open(MODEL_FILE, 'rb') as f:
    model = pickle.load(f)

base_options = mp_python.BaseOptions(model_asset_path=os.path.abspath('hand_landmarker.task'))
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
detector = vision.HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(0)

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
            
    while len(final_features) < 126:
        final_features.append(0.0)
        
    return final_features[:126]


print("\n--- WEBCAM STARTED ---")
print("Press 'Q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.flip(frame, 1)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    
    results = detector.detect(mp_image)
    
    if results.hand_landmarks:
        features = extract_normalized_features(results.hand_landmarks)
        
        input_data = np.array(features).reshape(1, -1)
        prob = model.predict_proba(input_data)[0]
        max_prob_idx = np.argmax(prob)
        confidence = prob[max_prob_idx]
        
        prediction = "?"
        if confidence > 0.5:
            prediction = model.classes_[max_prob_idx]
        
        # Draw UI
        h, w, _ = frame.shape
        x_min, y_min = w, h
        x_max, y_max = 0, 0
        
        for hand_landmarks in results.hand_landmarks:
            for lm in hand_landmarks:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 3, (255, 0, 0), -1)
                if cx < x_min: x_min = cx
                if cx > x_max: x_max = cx
                if cy < y_min: y_min = cy
                if cy > y_max: y_max = cy
            
        cv2.putText(frame, f"Sign: {prediction} ({confidence*100:.1f}%)", (x_min, max(0, y_min - 10)), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:
        cv2.putText(frame, "No hand detected.", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

    cv2.imshow("Dual-Hand Landmark Sign Language Detector", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break
        
cap.release()
cv2.destroyAllWindows()

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import os
import csv

DATASET_FILE = 'landmark_dataset.csv'

# Initialize MediaPipe Tasks HandLandmarker for 2 hands
base_options = mp_python.BaseOptions(model_asset_path=os.path.abspath('hand_landmarker.task'))
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=2)
detector = vision.HandLandmarker.create_from_options(options)

cap = cv2.VideoCapture(0)

# Create the CSV file with headers for 42 points (2 hands)
if not os.path.exists(DATASET_FILE):
    with open(DATASET_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        headers = ['label']
        for i in range(42): # 21 points * 2 hands
            headers.extend([f'x{i}', f'y{i}', f'z{i}'])
        writer.writerow(headers)

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
            
    # Pad to 126 features if only 1 hand or 0 hands
    while len(final_features) < 126:
        final_features.append(0.0)
        
    return final_features[:126]


print("\n--- DUAL-HAND DATA COLLECTION MODE ---")
print("How to use:")
print("1. Show a hand sign to the camera (1 or 2 hands).")
print("2. Press a LETTER key to save a snapshot.")
print("3. Gather 10-20 good samples per sign.")
print("4. Press '1' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.flip(frame, 1)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    
    results = detector.detect(mp_image)
    num_hands_detected = len(results.hand_landmarks) if results.hand_landmarks else 0
    
    features = []
    
    if num_hands_detected > 0:
        features = extract_normalized_features(results.hand_landmarks)
            
        # Draw joints so user knows it's working
        h, w, _ = frame.shape
        for hand_landmarks in results.hand_landmarks:
            for lm in hand_landmarks:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 4, (0, 255, 0), -1)
            
        cv2.putText(frame, f"Hands Tracked: {num_hands_detected}. Ready to Save!", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    else:
        cv2.putText(frame, "No hand detected", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
    cv2.putText(frame, "Press a LETTER key to capture.", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.imshow("Data Collection", frame)

    key = cv2.waitKey(1) & 0xFF
    
    if key == ord('1'):
        break
        
    elif (ord('a') <= key <= ord('z') or ord('0') <= key <= ord('9')) and num_hands_detected > 0:
        label = chr(key).upper()
        with open(DATASET_FILE, mode='a', newline='') as f:
            writer = csv.writer(f)
            row = [label] + features
            writer.writerow(row)
        print(f"Captured snapshot for '{label}'! ({num_hands_detected} hands)")
        
cap.release()
cv2.destroyAllWindows()

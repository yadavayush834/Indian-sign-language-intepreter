import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import os
import csv
import time

DATASET_FILE = 'sequence_dataset.csv'
SEQUENCE_LENGTH = 30  # Number of frames per gesture

# Initialize MediaPipe Tasks HandLandmarker for 2 hands
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
            
    # Pad to 126 features if only 1 hand or 0 hands
    while len(final_features) < 126:
        final_features.append(0.0)
        
    return final_features[:126]

# Create the CSV file with headers for (30 frames * 126 features)
if not os.path.exists(DATASET_FILE):
    with open(DATASET_FILE, mode='w', newline='') as f:
        writer = csv.writer(f)
        headers = ['label']
        for frame_idx in range(SEQUENCE_LENGTH):
            for i in range(42): # 2 hands * 21 points
                headers.extend([f'f{frame_idx}_x{i}', f'f{frame_idx}_y{i}', f'f{frame_idx}_z{i}'])
        writer.writerow(headers)

print("\n--- DYNAMIC SIGN COLLECTION MODE ---")
print("How to use:")
print("1. Enter the word you want to record.")
print("2. Get ready, then HOLD 'SPACEBAR' to record a 1-second motion (30 frames).")
print("3. Gather 15-20 sequences per word for best results.")
print("4. Press 'Q' to quit script.")

current_label = input("\nEnter the name of the SIGN you are recording (e.g. THANKS, HI): ").strip().upper()

recording = False
frame_counter = 0
sequence_buffer = []

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    frame = cv2.flip(frame, 1)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    
    results = detector.detect(mp_image)
    num_hands_detected = len(results.hand_landmarks) if results.hand_landmarks else 0
    
    # Draw landmarks
    h, w, _ = frame.shape
    if results.hand_landmarks:
        for hand_landmarks in results.hand_landmarks:
            for lm in hand_landmarks:
                cx, cy = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (cx, cy), 3, (0, 255, 0), -1)

    key = cv2.waitKey(1) & 0xFF
    
    if key == ord('q'):
        break
    if key == ord('n'):
        current_label = input("\nEnter the NEW sign name: ").strip().upper()

    # START RECORDING ON SPACE
    if key == ord(' ') and not recording:
        recording = True
        frame_counter = 0
        sequence_buffer = []
        print(f"Recording sequence for '{current_label}'...")

    if recording:
        features = extract_normalized_features(results.hand_landmarks)
        sequence_buffer.extend(features)
        frame_counter += 1
        
        cv2.putText(frame, f"RECORDING: {frame_counter}/{SEQUENCE_LENGTH}", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        if frame_counter >= SEQUENCE_LENGTH:
            recording = False
            # Save to CSV
            with open(DATASET_FILE, mode='a', newline='') as f:
                writer = csv.writer(f)
                writer.writerow([current_label] + sequence_buffer)
            print(f"Saved sequence {current_label}! (Total frames: {len(sequence_buffer)//126})")
    else:
        cv2.putText(frame, f"Ready for: {current_label}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, "Press SPACE to start recording 30 frames.", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
        cv2.putText(frame, "Press 'N' to change label.", (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

    cv2.imshow("Sequence Collection", frame)

cap.release()
cv2.destroyAllWindows()

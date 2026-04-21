import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision
import os

# Suppress Tensorflow logs for a cleaner terminal
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# ======================== Configuration ========================
ASL_MODEL_PATH = 'americanSignLanguage.h5'
ISL_MODEL_PATH = 'indianSignLanguage.h5'
DIGITS_MODEL_PATH = 'digitSignLanguage.h5'

# Define class mappings
ISL_CLASSES = [chr(i) for i in range(65, 91)] 
ASL_CLASSES = [chr(i) for i in range(65, 91) if chr(i) not in ['J', 'Z']] + ['Z', 'UNK'] 
DIGITS_CLASSES = [str(i) for i in range(10)]

print("Loading Models... Please wait.")
model_asl = load_model(ASL_MODEL_PATH)
model_isl = load_model(ISL_MODEL_PATH)
model_digits = load_model(DIGITS_MODEL_PATH)
print("Models loaded successfully!")

# Initialize MediaPipe Tasks HandLandmarker
base_options = mp_python.BaseOptions(model_asset_path=os.path.abspath('hand_landmarker.task'))
options = vision.HandLandmarkerOptions(base_options=base_options, num_hands=1)
detector = vision.HandLandmarker.create_from_options(options)

current_mode = 2
mode_names = {1: "American Sign Language", 2: "Indian Sign Language", 3: "Digit Sign Language"}

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print("\n--- WEBCAM STARTED ---")
print("Controls:")
print("Press '1': American Sign Language")
print("Press '2': Indian Sign Language")
print("Press '3': Digit Sign Language")
print("Press 'Q': Quit application")

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Flip the frame horizontally for a mirror effect
    frame = cv2.flip(frame, 1)
    
    h, w, c = frame.shape
    
    # Convert BGR format to RGB format for MediaPipe Processing
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
    
    # Process the frame with MediaPipe
    results = detector.detect(mp_image)
    
    predicted_char = ""
    prob = 0.0

    if results.hand_landmarks:
        for hand_landmarks in results.hand_landmarks:
            
            # Find Bounding Box for the hand
            x_min, y_min = w, h
            x_max, y_max = 0, 0
            
            for lm in hand_landmarks:
                x, y = int(lm.x * w), int(lm.y * h)
                cv2.circle(frame, (x, y), 2, (255, 0, 0), -1) # Draw joints
                if x < x_min: x_min = x
                if x > x_max: x_max = x
                if y < y_min: y_min = y
                if y > y_max: y_max = y
            
            # Add padding to guarantee the whole hand fits (+ a bit more context)
            padding = 40
            x_min = max(0, x_min - padding)
            y_min = max(0, y_min - padding)
            x_max = min(w, x_max + padding)
            y_max = min(h, y_max + padding)
            
            # Draw Bounding Box
            cv2.rectangle(frame, (x_min, y_min), (x_max, y_max), (0, 255, 0), 2)
            roi_rgb = frame_rgb[y_min:y_max, x_min:x_max]
            
            if roi_rgb.size == 0 or roi_rgb.shape[0] == 0 or roi_rgb.shape[1] == 0:
                continue

            try:
                if current_mode == 1:
                    # ASL model requires Grayscale 28x28
                    roi_gray = cv2.cvtColor(roi_rgb, cv2.COLOR_RGB2GRAY)
                    roi_resized = cv2.resize(roi_gray, (28, 28))
                    roi_normalized = roi_resized / 255.0
                    roi_input = np.expand_dims(roi_normalized, axis=(0, -1)) # (1, 28, 28, 1)
                    
                    prediction = model_asl.predict(roi_input, verbose=0)
                    class_idx = np.argmax(prediction[0])
                    prob = prediction[0][class_idx]
                    if class_idx < len(ASL_CLASSES):
                        predicted_char = ASL_CLASSES[class_idx]
                    else:
                        predicted_char = "?"
                        
                elif current_mode == 2:
                    # ISL model requires RGB 32x32
                    roi_resized = cv2.resize(roi_rgb, (32, 32))
                    roi_normalized = roi_resized / 255.0
                    roi_input = np.expand_dims(roi_normalized, axis=0) # (1, 32, 32, 3)
                    
                    prediction = model_isl.predict(roi_input, verbose=0)
                    class_idx = np.argmax(prediction[0])
                    prob = prediction[0][class_idx]
                    predicted_char = ISL_CLASSES[class_idx]
                    
                elif current_mode == 3:
                    # Digits model requires RGB 32x32
                    roi_resized = cv2.resize(roi_rgb, (32, 32))
                    roi_normalized = roi_resized / 255.0
                    roi_input = np.expand_dims(roi_normalized, axis=0) # (1, 32, 32, 3)
                    
                    prediction = model_digits.predict(roi_input, verbose=0)
                    class_idx = np.argmax(prediction[0])
                    prob = prediction[0][class_idx]
                    predicted_char = DIGITS_CLASSES[class_idx]
                    
            except Exception as e:
                # Catch small errors on frame edges, etc.
                pass
            
            # Display Prediction
            if prob > 0.5:
                cv2.putText(frame, f"{predicted_char} ({prob*100:.1f}%)", (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            else:
                cv2.putText(frame, "?", (x_min, y_min - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

            break # Only process one hand
    else:
        cv2.putText(frame, f"No hand detected.", (int(w/2) - 100, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)

    # Global UI
    cv2.putText(frame, f"Mode: {mode_names[current_mode]}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    cv2.putText(frame, f"Press 1=ASL, 2=ISL, 3=Digits, Q=Quit", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
        
    cv2.imshow("Sign Language Detector - MediaPipe Enhanced", frame)

    # Key Press Handle
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('1'):
        current_mode = 1
    elif key == ord('2'):
        current_mode = 2
    elif key == ord('3'):
        current_mode = 3

cap.release()
cv2.destroyAllWindows()

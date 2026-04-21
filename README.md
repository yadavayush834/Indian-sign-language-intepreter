# Robust Landmark-Based Sign Language Interpreter

A real-time, highly robust Machine Learning pipeline for detecting completely custom physical gestures, including two-handed signs and digits (Indian Sign Language, ASL, custom vocabulary, etc.).

Unlike traditional camera/CNN pixel-based detectors which suffer heavily from environmental "domain shift" (changes in room lighting, backgrounds, camera angle, and skin tone), this project uses **Google MediaPipe** to dynamically extract 126 normalized 3D hand coordinates (42 joints * (X,Y,Z)). 

This means the actual AI model never processes colors or images—it only analyzes pure geometry and skeletal shape! The result is a mathematically bulletproof classifier that runs locally at ultra-high FPS.

## Prerequisites
- Python 3.10+
- A working webcam

## Quickstart Installation

1. Cleanly clone the repository:
```bash
git clone https://github.com/yadavayush834/isl-model_train.git
cd isl-model_train
```

2. Create a virtual environment and activate it:
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install project sub-dependencies:
```bash
pip install -r requirements.txt
```

---

## 3-Step Training Workflow

You can customize this model to recognize **any** gesture across 1 or 2 hands. 

### Step 1: Collect Data
Gather hundreds of 3D skeletal snapshots using the data collector. 
```bash
python collect_data.py
```
*   Hold up your hand(s) to the camera (the app will dynamically handle 1 or 2 hands thanks to zero-padding architecture).
*   While showing the sign, press the corresponding key on your keyboard to instantly log that exact coordinate frame to `landmark_dataset.csv`.
*   *(Tip: Use letters `A-Z` and numbers `0-9`. Move your hand slightly while pressing the key to capture natural variations).*

### Step 2: Train the ML Model
Once you have collected data for at least 2 distinct signs, immediately generate a custom model:
```bash
python train_model.py
```
This reads `landmark_dataset.csv`, drops the 126 features into an ultra-fast `RandomForestClassifier`, and packages it into `landmark_rf_model.pkl` in under 2 seconds.

### Step 3: Real-Time Inference
Launch the real-time detector to test your newly trained model:
```bash
python realtime_landmarks.py
```
The app will bind to your webcam, hunt for the signs trained in Step 2, and overlay real-time confident classifications!

## Contributing (Collaboration)
Because this project utilizes a custom CSV architecture, you and a collaborating developer can train your hands independently! 

1. Pull the repo locally.
2. Run `collect_data.py` to add your personal hand sign skeleton variants directly to the very end of the shared `landmark_dataset.csv`.
3. Push the `landmark_dataset.csv` update back to GitHub! 

When anyone else pulls down your new CSV changes and runs `train_model.py`, the AI will effortlessly learn to recognize both of your hands!

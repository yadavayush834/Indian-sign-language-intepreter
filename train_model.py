import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

DATASET_FILE = 'landmark_dataset.csv'
MODEL_FILE = 'landmark_rf_model.pkl'

print("--- TRAINING MODEL ---")

if not os.path.exists(DATASET_FILE):
    print(f"Error: {DATASET_FILE} not found. Please run collect_data.py first to gather some data!")
    exit()

# 1. Load Data
try:
    df = pd.read_csv(DATASET_FILE)
except Exception as e:
    print(f"Error reading CSV: {e}")
    exit()

if df.empty or len(df) < 5:
    print("Dataset is too small or empty. Please use collect_data.py to add more samples!")
    exit()

# 2. Extract Features and Labels
X = df.drop('label', axis=1).values
y = df['label'].values

# Check if there is only 1 class
if len(np.unique(y)) < 2:
    print(f"Dataset has only {len(np.unique(y))} class. You must collect data for at least 2 different signs (e.g., 'A' and 'B') to train a classifier.")
    exit()

# 3. Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print(f"Loaded {len(df)} samples across {len(np.unique(y))} classes {np.unique(y)}.")
print("Training Random Forest Classifier on Normalized Landmarks...")

# 4. Train Model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\nModel Validation Accuracy: {acc * 100:.2f}%")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# 6. Save Model
with open(MODEL_FILE, 'wb') as f:
    pickle.dump(model, f)
    
print(f"\nSuccess! New lightweight model saved as {MODEL_FILE}")
print("You can now run realtime_landmarks.py to use it.")

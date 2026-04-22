import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, Input

DATASET_FILE = 'sequence_dataset.csv'
MODEL_FILE = 'sequence_model.keras'

print("--- TRAINING DYNAMIC SEQUENCE MODEL (LSTM) ---")

if not os.path.exists(DATASET_FILE):
    print(f"Error: {DATASET_FILE} not found. Please run collect_sequences.py first!")
    exit()

# 1. Load Data
df = pd.read_csv(DATASET_FILE)
print(f"Loaded {len(df)} sequence samples.")

# 2. Preprocessing
X = df.drop('label', axis=1).values
y = df['label'].values

# Reshape X to (samples, time_steps, features)
# Each frame has 126 features, and we have 30 frames
X = X.reshape(-1, 30, 126)

# Encode Labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
num_classes = len(np.unique(y))

# One-hot encoding for the labels
y_categorical = tf.keras.utils.to_categorical(y_encoded, num_classes=num_classes)

# 3. Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y_categorical, test_size=0.1, random_state=42)

# 4. Build Model
model = Sequential([
    Input(shape=(30, 126)),
    LSTM(64, return_sequences=True, activation='relu'),
    LSTM(128, return_sequences=False, activation='relu'),
    Dense(64, activation='relu'),
    Dropout(0.2),
    Dense(32, activation='relu'),
    Dense(num_classes, activation='softmax')
])

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

print("\nTraining Model...")
model.fit(X_train, y_train, epochs=100, batch_size=32, validation_data=(X_test, y_test))

# 5. Save Model and Labels
model.save(MODEL_FILE)

# Save the classes so the backend knows which index is which word
classes = label_encoder.classes_
with open('sequence_labels.txt', 'w') as f:
    for cls in classes:
        f.write(f"{cls}\n")

print(f"\nSuccess! Dynamic model saved as {MODEL_FILE}")
print(f"Classes found: {classes}")

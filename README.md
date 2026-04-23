# Robust Landmark-Based Sign Language Interpreter

This project provides a real-time sign language pipeline for both model training and app usage.

It uses Google MediaPipe hand landmarks (126 normalized 3D features for up to two hands) instead of raw pixels. That makes inference more robust to lighting/background changes and keeps runtime fast.

## What this repository includes
- Model data collection and training scripts (static and sequence)
- Python FastAPI backend for inference
- React frontend app (Sign-to-Text and Text-to-Sign)
- Pretrained artifacts support (`landmark_rf_model.pkl`, `sequence_model.keras`, etc.)

## Prerequisites
- Git
- Node.js 20+
- Python 3.10+
- Webcam

## Project structure
- `ISL-Interpreter/Frontend` - React frontend
- `ISL-Interpreter/backend` - FastAPI backend
- `collect_data.py` - static landmark data collection
- `train_model.py` - static RF training
- `collect_sequences.py` - sequence data collection
- `train_sequence_model.py` - LSTM sequence training

## Beginner setup (run frontend + backend)

### 1) Clone and enter repo
```bash
git clone <your-repo-url>
cd <your-cloned-folder>
```

### 2) Ensure required model files exist
Place these in the project root:
- `landmark_rf_model.pkl`
- `hand_landmarker.task`

Optional for dynamic mode:
- `sequence_model.keras`
- `sequence_labels.txt`

### 3) Start backend (Terminal 1)
```bash
cd ISL-Interpreter/backend
python -m venv .venv
```

Activate venv:

Windows PowerShell:
```powershell
.\.venv\Scripts\Activate.ps1
```

Windows CMD:
```cmd
.venv\Scripts\activate.bat
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install and run backend:
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Health check:
```bash
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status":"ok"}
```

### 4) Start frontend (Terminal 2)
```bash
cd ISL-Interpreter/Frontend
```

Create env file if needed:

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

macOS/Linux:
```bash
cp .env.example .env
```

Run frontend:
```bash
npm install
npm run dev
```

Open:
- `http://localhost:5173/app`

## Training workflow (custom signs)

### Static model
1. Collect landmark snapshots:
```bash
python collect_data.py
```

2. Train RF model:
```bash
python train_model.py
```

3. Test in real time:
```bash
python realtime_landmarks.py
```

### Dynamic sequence model
1. Collect sequence samples:
```bash
python collect_sequences.py
```

2. Train sequence model:
```bash
python train_sequence_model.py
```

This produces:
- `sequence_model.keras`
- `sequence_labels.txt`

## Common issues

### `uvicorn` command not found
Use module form:
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Camera opens but no predictions
Check:
- backend is running without errors
- required model files are present at project root
- frontend points to correct backend URL
- app route is `http://localhost:5173/app`

### Port 8000 in use
Run backend on another port:
```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

Then set in `ISL-Interpreter/Frontend/.env`:
```env
VITE_SIGN_API_URL=http://localhost:8001
```

Restart frontend after `.env` changes.

## Stop servers
Press `Ctrl + C` in each running terminal.

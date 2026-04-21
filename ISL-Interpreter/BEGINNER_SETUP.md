# Beginner Setup Guide: Run Frontend + Backend Locally (Windows)

This guide is for first-time users.

## What you will run
- Frontend: React app in `ISL-Interpreter/Frontend`
- Backend: Python FastAPI server in `ISL-Interpreter/backend`

## Prerequisites
Install these first:
- Node.js (v20 or newer)
- Python (3.10+ recommended)

## Important files needed for sign prediction
Place these in your workspace root (`D:\user2\model_train - Copy`):
- `landmark_rf_model.pkl`
- `hand_landmarker.task`

## 1) Start Backend Server (Terminal 1)
Open PowerShell and run:

```powershell
Set-Location "D:\user2\model_train - Copy"

# Activate your existing venv (recommended)
. .\venv\Scripts\Activate.ps1

Set-Location "D:\user2\model_train - Copy\ISL-Interpreter\backend"
python -m pip install -r requirements.txt

# Use python -m uvicorn (more reliable on Windows)
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Expected output includes:
- `Uvicorn running on http://0.0.0.0:8000`

## 2) Start Frontend Server (Terminal 2)
Open a second PowerShell window and run:

```powershell
Set-Location "D:\user2\model_train - Copy\ISL-Interpreter\Frontend"

# First time only
copy .env.example .env
npm install

# Start frontend
npm run dev
```

Expected output includes:
- `Local: http://localhost:5173/`

## 3) Open App in Browser
- Open: `http://localhost:5173/app`
- Click `Start Translation`
- Allow camera permission
- Show your hand sign clearly to camera

## Quick Health Check
If prediction does not appear, check backend quickly in a third terminal:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
```

Expected result:

```text
status
------
ok
```

## Common Beginner Issues

### Issue: `uvicorn` command fails
Use this instead:
- `python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload`

### Issue: Camera opens but no prediction
Check:
- Backend terminal is still running
- `landmark_rf_model.pkl` exists in workspace root
- `hand_landmarker.task` exists in workspace root
- You opened the app at `/app` route

### Issue: Port already in use
If 8000 is busy:
- Run backend on another port (example 8001)
- Update `VITE_SIGN_API_URL` in `Frontend/.env` to same port

Example:

```env
VITE_SIGN_API_URL=http://localhost:8001
```

Then restart frontend.

## Stop Servers
- In each terminal, press `Ctrl + C`

# Beginner Setup Guide: Run Frontend + Backend Locally

This guide is for first-time users and works on any device, even if your folders have different names.

## What you will run
- Frontend: React app in `Frontend`
- Backend: Python FastAPI app in `backend`

## Prerequisites
Install these first:
- Git
- Node.js (v20+)
- Python (3.10+)

## 0) Clone the project
Choose any folder on your computer and run:

```bash
git clone https://github.com/ManuStu-web/ISL-Interpreter.git
cd ISL-Interpreter
```

If your cloned folder has another name, use that name in all `cd` commands.

## 1) Required model files
Place these files in the project root (same level where `Frontend` and `backend` folders exist):
- `landmark_rf_model.pkl`
- `hand_landmarker.task`

Quick check (from project root):

```bash
ls landmark_rf_model.pkl hand_landmarker.task
```

## 2) Create and activate Python virtual environment (backend)
Open Terminal 1 and go to backend:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv .venv
```

Activate virtual environment:

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

Install backend dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Start backend server:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Expected output includes:
- `Uvicorn running on http://0.0.0.0:8000`

## 3) Start frontend (Terminal 2)
Open a second terminal and go to frontend:

```bash
cd ISL-Interpreter/Frontend
```

If you are already inside `ISL-Interpreter`, run `cd Frontend`.

Create frontend env file (first time only):

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Install and run:

```bash
npm install
npm run dev
```

Expected output includes:
- `Local: http://localhost:5173/`

## 4) Open app
- Open `http://localhost:5173/app`
- Click `Start Translation`
- Allow camera access
- Show your hand sign clearly

## 5) Quick backend health check
If prediction is not showing, test backend in Terminal 3:

```bash
curl http://127.0.0.1:8000/health
```

PowerShell alternative:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/health" -Method Get
```

Expected result contains:

```json
{"status":"ok"}
```

## Common issues

### `uvicorn` command fails
Use:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Camera opens but no prediction
Check:
- Backend terminal is running without errors
- `landmark_rf_model.pkl` is in project root
- `hand_landmarker.task` is in project root
- You opened `/app` route

### Port 8000 already in use
Run backend on another port:

```bash
python -m uvicorn app:app --host 0.0.0.0 --port 8001 --reload
```

Then edit `Frontend/.env`:

```env
VITE_SIGN_API_URL=http://localhost:8001
```

Restart frontend after changing `.env`.

## Stop servers
In each running terminal, press `Ctrl + C`.

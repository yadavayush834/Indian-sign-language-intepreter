# Python Inference Backend

This backend exposes your local landmark model (`landmark_rf_model.pkl`) as an HTTP API used by the React camera UI.

## Files Expected
By default, `app.py` looks for model assets in the parent workspace folder.

Required files:
- `landmark_rf_model.pkl`
- `hand_landmarker.task`

If your models are in another folder, set `MODEL_DIR` before running.

## Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
```

## Run
```powershell
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints
- `GET /health`
- `POST /predict`
  - form-data:
    - `image`: JPEG/PNG frame
    - `threshold`: confidence threshold (default `0.5`)

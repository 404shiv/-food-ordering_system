# QuickBite Food Ordering System

## Overview

This repository includes a FastAPI backend and a React + Vite frontend for a food ordering application.

- `backend/` contains the FastAPI app, MongoDB config, and API routes.
- `frontend/` contains the React UI built with Vite and Tailwind CSS.

## Requirements

- Python 3.11+ (3.13 is supported)
- Node.js 18+ / npm
- MongoDB running locally or remotely

## Backend Setup

1. Open a terminal in `backend/`.
2. Create and activate the virtual environment if needed.
3. Install dependencies:

```powershell
pip install -r requirements.txt
```

4. Copy or update the `.env` file.

### Default backend env values

```env
PORT=8001
HOST=0.0.0.0
DEBUG=True
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=quickbite
SECRET_KEY=quickbite_super_secret_jwt_key_2026_production_viva_grade
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
GST_PERCENTAGE=5.0
DEFAULT_DELIVERY_CHARGE=40.0
FREE_DELIVERY_THRESHOLD=500.0
```

5. Start the backend server:

```powershell
cd backend
py -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Or from the repo root:

```powershell
cd "c:\Users\ASUS\OneDrive\Desktop\food-ordering_system"
py -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8001
```

6. Confirm the API is online at:

- `http://127.0.0.1:8001/`
- `http://127.0.0.1:8001/api/v1/docs`

## Frontend Setup

1. Open a terminal in `frontend/`.
2. Install dependencies:

```powershell
npm install
```

3. Start the frontend dev server:

```powershell
npm run dev
```

4. Open the app in the browser at the URL shown by Vite (typically `http://localhost:5173`).

## Proxy Configuration

The frontend is configured to proxy API and upload requests to the backend on port `8001` in `frontend/vite.config.js`.

## Production Build

To build the frontend for production:

```powershell
cd frontend
npm run build
```

To preview the built frontend locally:

```powershell
npm run preview
```

## Notes

- The backend uses `.env` in `backend/` and loads it via `pydantic-settings`.
- The frontend API client is configured with base path `/api/v1` in `frontend/src/services/api.js`.
- If port `8000` is unavailable, use port `8001` as configured.

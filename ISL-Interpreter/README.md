<div align="center">

# 🤟 ISL Interpreter

### Real-time Indian Sign Language to Text Converter

*No app install required — works directly in your browser*

![Demo Placeholder](https://placehold.co/800x400/1D9E75/ffffff?text=Demo+GIF+Coming+Soon)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-orange?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-0097A7?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![Java](https://img.shields.io/badge/Java-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/)
[![MySQL](https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

</div>

---

## 🧠 About The Project

India has **63 lakh+ deaf and hard-of-hearing individuals** who face communication barriers daily. Existing solutions require expensive hardware or app installations.

**ISL Interpreter** is a browser-based web application that:
- Detects hand gestures in **real-time** using your webcam
- Converts Indian Sign Language gestures to **text and speech**
- Works on **any device** with a browser — zero installation needed
- Saves your **translation history** for later reference

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🎥 Real-time Detection | Live webcam feed with instant gesture recognition |
| 🤖 AI-Powered | MediaPipe Hands + TensorFlow.js for accurate classification |
| 📝 Sentence Builder | Collects letters → forms complete words and sentences |
| 🔊 Text to Speech | Converts translated text to audio output |
| 📊 Confidence Score | Shows how confident the model is for each gesture |
| 🗂️ History | Saves all translated sessions for logged-in users |
| 🔐 Authentication | Secure user login and registration |

---

## 🖼️ Screenshots

> *Screenshots will be added once the UI is complete*

| Translator Page | History Page |
|---|---|
| ![Translator](https://placehold.co/400x250/0F6E56/ffffff?text=Translator+Page) | ![History](https://placehold.co/400x250/185FA5/ffffff?text=History+Page) |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI framework
- **Tailwind CSS v4** — Styling
- **MediaPipe Hands** — Hand landmark detection (21 points)
- **TensorFlow.js** — Gesture classification using pre-trained ISL model
- **Axios** — API communication

### Backend
- **Java Spring Boot** — REST API server
- **Spring Security** — Authentication
- **Spring Data JPA** — Database ORM
- **MySQL** — Data storage

### Deployment
- **Vercel** — Frontend hosting
- **Render.com** — Backend hosting
- **Railway.app** — Database hosting

---

## 🚀 Getting Started

New here? Follow the beginner guide: **[BEGINNER_SETUP.md](BEGINNER_SETUP.md)**

### Prerequisites
- Node.js v20+
- Java JDK 17+
- MySQL
- Maven

### Frontend Setup

```bash
# Clone the repo
git clone https://github.com/ManuStu-web/ISL-Interpreter.git

# Go to frontend
cd ISL-Interpreter/frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Backend Setup

```bash
# Go to backend
cd ISL-Interpreter/backend

# Run with Maven
./mvnw spring-boot:run
```

> Configure your MySQL credentials in `application.properties` before running.

### Python Model Bridge (Landmark .pkl Inference)

If you want to run your landmark-based model flow from the Python project inside this website, use the lightweight FastAPI backend in `backend/app.py`.

```bash
# In a new terminal
cd ISL-Interpreter/backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

Then configure the frontend API URL:

```bash
cd ISL-Interpreter/Frontend
copy .env.example .env
npm install
npm run dev
```

The frontend camera component sends JPEG frames to `POST /predict` and displays returned `label + confidence` in real time.

Important: keep these model files accessible from the workspace root (or set `MODEL_DIR`):
- `landmark_rf_model.pkl`
- `hand_landmarker.task`

---

## 🏗️ Project Architecture

```
ISL-Interpreter/
├── frontend/                  # React app (VS Code)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Translator, History, Login
│   │   └── App.jsx
│   └── package.json
│
└── backend/                   # Spring Boot app (IntelliJ)
    ├── src/main/java/
    │   ├── controller/        # REST API endpoints
    │   ├── service/           # Business logic
    │   ├── model/             # JPA entities
    │   └── repository/        # Database layer
    └── pom.xml
```

---

## 🔄 How It Works

```
User shows hand gesture
        ↓
getUserMedia (webcam access)
        ↓
Canvas API (frame capture)
        ↓
MediaPipe Hands (21 landmarks)
        ↓
TensorFlow.js (gesture classification)
        ↓
React UI (display text)
        ↓
Spring Boot API (save history)
```

---

## 🌐 Live Demo

> 🔗 **[Coming Soon](#)** — Will be deployed on Vercel

---

## 📄 License

This project is built for educational purposes as part of **Project-I (Semester VI)**.

---

## 🙏 Acknowledgements

- [MediaPipe](https://mediapipe.dev/) by Google
- [TensorFlow.js](https://www.tensorflow.org/js)
- [ISL Dataset](https://github.com/) — Pre-trained model

---

<div align="center">

Made with ❤️ for 63 lakh+ deaf and hard-of-hearing Indians

⭐ Star this repo if you find it useful!

</div>

# 🧮 MathGenius AI

### 🚀 AI-Powered Adaptive Math Tutoring Platform

> **Personalized learning that adapts to you — not the other way around.**

---

## 📌 Overview

**MathGenius AI** is an intelligent, adaptive math tutoring platform designed to transform the way students learn mathematics.
Instead of simply providing answers, it focuses on **building conceptual understanding**, offering **step-by-step explanations**, and dynamically adjusting difficulty based on user performance.

The system combines **symbolic computation**, **AI-generated explanations**, and **adaptive learning strategies** to deliver a truly personalized experience.

---

## ✨ Key Features

### 🧠 Intelligent Problem Solving

* Supports **natural language queries** (e.g., "Solve x² - 5x + 6 = 0")
* Generates **step-by-step solutions**
* Provides **AI-based explanations tailored to user level**
* Uses symbolic computation (SymPy) for accurate math solving

---

### 📊 Adaptive Learning System

* Dynamically adjusts problem difficulty
* Tracks:

  * Accuracy rate
  * Response time
  * Learning progression
* Suggests personalized next-level questions
* Keeps users in the **optimal learning zone**

---

### ✍️ Math Rendering & Explanation

* Beautiful **LaTeX rendering** using KaTeX
* Structured explanations using Markdown
* Clean step-by-step reasoning

---

### 💬 Interactive Chat-Based UI

* Chat-style interface for solving problems
* Real-time responses
* Smooth animations and modern UI design

---

### ⚡ Additional Features

* 🎤 Speech input (optional)
* 🎨 Syntax highlighting
* 📱 Fully responsive design
* 🌙 Dark mode support

---

## 🏗️ Architecture

```
MathGenius-AI/
│
├── backend/                     # FastAPI Backend
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── solver.py
│   ├── adaptive_engine.py
│   ├── student_model.py
│   ├── quiz_engine.py
│   ├── routes/
│   │   ├── users.py
│   │   ├── solve.py
│   │   ├── analytics.py
│   │   ├── quiz.py
│   │   └── chats.py
│   └── utils/
│       └── llm_client.py
│
└── frontend/                    # Next.js Frontend
    ├── app/
    │   ├── page.tsx
    │   ├── login/page.tsx
    ├── components/
    ├── hooks/
    ├── lib/
```

---

## ⚙️ Tech Stack

### 🔹 Frontend

* Next.js (App Router)
* React
* TypeScript
* Tailwind CSS

### 🔹 Backend

* FastAPI
* Python
* SQLAlchemy
* SymPy

### 🔹 AI Integration

* Groq

### 🔹 Database

* SQLite (Development)
* PostgreSQL (Future scope)

---

## 🚀 Getting Started

## 1️⃣ Clone the Repository

git clone https://github.com/dikshamitra/MathGenius-AI.git
cd MathGenius-AI

---

## 2️⃣ Backend Setup

cd backend

### Create Virtual Environment

python -m venv venv

### Activate (Windows)

venv\Scripts\activate

### Install Dependencies

pip install -r requirements.txt

### Environment Setup

copy .env.example .env

Add your API key:
GROQ_API_KEY=your_api_key_here

### Run Backend Server

uvicorn main:app --reload

👉 Backend runs at:
http://127.0.0.1:8000

---

## 3️⃣ Frontend Setup

cd frontend

### Install Dependencies

npm install

### Environment Setup

copy .env.example .env.local

(Optional)
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

### Run Frontend

npm run dev

👉 Frontend runs at:
http://localhost:3000

---

## 🔐 Authentication Flow

1. User visits `/login`
2. User signs in using credentials
3. Backend returns JWT/access token
4. Token is stored in browser:

localStorage.setItem("auth_token", token)

5. Protected pages verify token:

localStorage.getItem("auth_token")

6. If token is missing → redirect to `/login`

---

## 🔧 API Endpoints

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| POST   | `/api/login`     | User login             |
| POST   | `/api/users`     | Register new user      |
| POST   | `/api/solve`     | Solve math problem     |
| POST   | `/api/quiz`      | Generate adaptive quiz |
| GET    | `/api/analytics` | Fetch user performance |

---

## 🧠 Core Modules

| Module          | Description                             |
| --------------- | --------------------------------------- |
| Solver Engine   | Handles symbolic math solving           |
| Adaptive Engine | Adjusts difficulty based on performance |
| Student Model   | Tracks learning progress                |
| Quiz Engine     | Generates personalized quizzes          |
| LLM Client      | Integrates AI explanations              |

---

## 📊 Learning Metrics

MathGenius AI tracks multiple performance indicators:

* 📈 Skill Score (0–100)
* ✅ Accuracy Rate
* ⏱️ Response Time
* 🚀 Improvement Rate
* 📚 Topic-wise performance

---

## 🎓 Educational Approach

* 🔄 Adaptive Learning
* 🏆 Mastery-Based Progression
* ⚡ Immediate Feedback
* 🎯 Personalized Recommendations

---

## 🚀 Deployment

### Using Docker

docker-compose up -d

---

## 👨‍💻 Team

| Member        | Role                     |
| ------------- | ------------------------ |
| Sneha Tiwari  | Backend & AI Integration |
| Diksha Mitra  | Frontend Development     |
| Hima Agarwal  | API Integration          |
| Arpita        | AI Output Rendering      |
| Pragya Pandey | Testing & Deployment     |

---

## 📜 License

This project is intended for **educational and research purposes only**.

---

## ❤️ Final Note

MathGenius AI is built with the vision of making mathematics **intuitive, adaptive, and accessible for everyone**.

> Learn smarter. Think deeper. Grow faster.

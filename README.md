# MathGenius AI - Adaptive Intelligent Tutoring System

![Status](https://img.shields.io/badge/Status-Production--Ready-green)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)

---

## 🎯 Overview

MathGenius AI is an **AI-powered adaptive math tutoring platform** designed to provide personalized learning experiences. Unlike traditional systems, it not only solves problems but also adapts explanations, generates quizzes, and tracks student performance over time.

The system combines **symbolic computation, AI-generated explanations, and adaptive learning strategies** to help students understand concepts rather than just memorizing solutions.

---

## ✨ Key Features

### 🧠 Intelligent Problem Solving

* Accepts natural language math queries
* Generates step-by-step solutions using symbolic computation
* Provides AI-powered explanations

### 📊 Adaptive Learning System

* Adjusts difficulty based on user performance
* Tracks accuracy, response time, and improvement
* Suggests next-level problems dynamically

👉 Adaptive learning systems continuously adjust based on student behavior and performance patterns ([Ruvimo][1])

---

### 📝 AI-Generated Quizzes

* Dynamic quiz generation based on selected topics
* Multiple question types (MCQ, short answer, etc.)
* Difficulty levels (easy, medium, hard)
* Auto-evaluation with feedback

---

### 📈 Performance Analytics Dashboard

* Tracks:

  * Skill score
  * Topic-wise accuracy
  * Learning progress over time
* Provides insights for improvement

---

### ✍️ Math Rendering & Explanation

* LaTeX rendering using KaTeX
* Markdown-based structured explanations
* Clean step-by-step reasoning

---

### 🎙️ Additional Features

* Speech input for problem solving
* Syntax highlighting for explanations
* Interactive UI with animations

---

## 🏗️ Architecture

```
MathGenius-AI/
├── backend/ (FastAPI - Python)
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── adaptive_engine.py
│   ├── student_model.py
│   ├── solver.py
│   ├── quiz_engine.py        # NEW: Quiz generation
│   ├── routes/
│   │   ├── solve.py
│   │   ├── analytics.py
│   │   ├── quiz.py           # NEW: Quiz APIs
│   │   └── users.py
│   └── utils/
│       └── llm_client.py
│
└── frontend/ (Next.js)
    ├── components/
    │   ├── ProblemSolver.tsx
    │   ├── QuizModule.tsx        # NEW
    │   ├── AnalyticsDashboard.tsx
    │   └── MathDisplay.tsx
    └── lib/api.ts
```

---

## 🚀 Tech Stack

### Frontend

* Next.js (React + TypeScript)
* Tailwind CSS
* Radix UI
* Recharts
* KaTeX

### Backend

* FastAPI (Python)
* SQLAlchemy
* SymPy
* LLM Integration (Groq/OpenAI)

### Database

* SQLite

### Tools

* Docker
* Git

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
python main.py
```

---

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 🔧 API Endpoints

### Solve Problem

```
POST /api/solve
```

### Quiz Generation

```
POST /api/quiz
```

### Analytics

```
GET /api/analytics/{user_id}
```

---

## 🧠 Core Modules

* **Adaptive Engine**
  Adjusts difficulty and explanation depth based on performance

* **Student Model**
  Tracks learning progress and skill levels

* **Solver Engine**
  Uses SymPy for symbolic math solving

* **Quiz Engine (New)**
  Generates adaptive quizzes dynamically

* **LLM Client**
  Handles AI-based explanations and NLP

---

## 📊 Learning Metrics

* Skill Score (0–100)
* Accuracy Rate
* Response Time
* Improvement Rate
* Topic-wise Breakdown

---

## 🎓 Educational Approach

* Adaptive Learning
* Mastery-Based Progression
* Immediate Feedback
* Personalized Recommendations

AI tutoring systems enhance learning by adapting explanations and providing structured guidance rather than just answers ([Scale][2])

---

## 🚀 Deployment

```bash
docker-compose up -d
```

---

## 👥 Team Contributions

* **Sneha Tiwari (24BCAE11287) – Backend & AI Integration**
  Developed backend services using FastAPI, implemented APIs, integrated AI logic, and managed database and system architecture.

* **Diksha Mitra – Frontend Development**
  Designed and implemented UI using Next.js, Tailwind CSS, and integrated APIs.

* **Hima Agarwal – API Integration**
  Connected frontend with backend services and handled data flow.

* **Arpita – AI Output & Rendering**
  Worked on formatting AI responses using Markdown and KaTeX.

* **Pragya Pandey – Testing & Deployment**
  Performed testing, debugging, environment setup, and documentation.

---

## 📌 Future Scope

* Authentication system
* PostgreSQL integration
* Cloud deployment
* Advanced analytics
* Multi-language support

---

## 📜 License

For educational and research purposes.


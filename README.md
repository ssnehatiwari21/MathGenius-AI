<div align="center">

<img src="https://img.shields.io/badge/MathGenius-AI-6366f1?style=for-the-badge&logo=openai&logoColor=white" alt="MathGenius AI"/>

# 🧮 MathGenius AI

### *AI-Powered Adaptive Math Tutoring Platform*

> Personalized learning that adapts to **you** — not the other way around.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)

</div>

---

## 🎯 Overview

**MathGenius AI** is an intelligent, adaptive math tutoring platform that goes beyond simply solving problems. It understands *how you learn*, adjusts its approach in real-time, and helps you build genuine mathematical intuition — not just memorize solutions.

Combining **symbolic computation**, **AI-generated explanations**, and **adaptive learning strategies**, MathGenius AI creates a truly personalized educational experience.

---

## ✨ Key Features

### 🧠 Intelligent Problem Solving
- Accepts **natural language** math queries
- Generates **step-by-step solutions** using symbolic computation
- Provides **AI-powered explanations** tailored to your level

### 📊 Adaptive Learning System
- **Adjusts difficulty** dynamically based on your performance
- Tracks **accuracy**, **response time**, and **improvement trends**
- Suggests **next-level problems** to keep you in the optimal learning zone
- Delivers **personalized insights** for continuous growth

### ✍️ Math Rendering & Explanation
- Beautiful **LaTeX rendering** via KaTeX
- **Markdown-based** structured explanations
- Clean **step-by-step reasoning** for every solution

### 🎙️ Additional Features
- 🎤 **Speech input** for hands-free problem solving
- 🎨 **Syntax highlighting** for expressions
- ✨ **Interactive UI** with smooth animations

---

## 🏗️ Architecture

```
MathGenius-AI/
├── backend/                    # FastAPI — Python
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── adaptive_engine.py      # Core adaptive logic
│   ├── student_model.py        # Learning progress tracker
│   ├── solver.py               # SymPy symbolic solver
│   ├── quiz_engine.py          # Dynamic quiz generation
│   ├── routes/
│   │   ├── solve.py
│   │   ├── analytics.py
│   │   ├── quiz.py
│   │   └── users.py
│   └── utils/
│       └── llm_client.py       # LLM integration layer
│
└── frontend/                   # Next.js
    ├── components/
    │   ├── ProblemSolver.tsx
    │   ├── QuizModule.tsx
    │   ├── AnalyticsDashboard.tsx
    │   └── MathDisplay.tsx
    └── lib/
        └── api.ts
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js · React · TypeScript · Tailwind CSS |
| **UI Components** | Radix UI · Recharts · KaTeX |
| **Backend** | FastAPI · Python · SQLAlchemy · SymPy |
| **AI/LLM** | Groq / OpenAI Integration |
| **Database** | SQLite |
| **DevOps** | Docker · Git |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/ssnehatiwari21/MathGenius-AI.git
cd MathGenius-AI
```

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

**Create your `.env` file:**

```bash
# Windows (PowerShell)
copy .env.example .env
```

**Add your API key in `.env`:**

```env
GROQ_API_KEY=your_api_key_here
```

**Start the backend server:**

```bash
uvicorn main:app --reload
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

**Create environment file:**

```bash
# Windows (PowerShell)
copy .env.example .env.local
```

**Start the frontend:**

```bash
npm run dev
```

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/solve` | Submit a math problem for solving |
| `POST` | `/api/quiz` | Generate an adaptive quiz |
| `GET` | `/api/analytics/{user_id}` | Fetch student performance analytics |

---

## 🧠 Core Modules

| Module | Role |
|--------|------|
| **Adaptive Engine** | Adjusts difficulty and explanation style in real-time |
| **Student Model** | Tracks and models individual learning progress |
| **Solver Engine** | Symbolic math solving powered by SymPy |
| **Quiz Engine** | Generates dynamic, personalized quizzes |
| **LLM Client** | Bridges AI explanations with math solutions |

---

## 📊 Learning Metrics

MathGenius AI tracks a rich set of learning signals:

```
📈 Skill Score          (0 – 100)
✅ Accuracy Rate
⏱️  Response Time
🚀 Improvement Rate
📚 Topic-wise Breakdown
```

---

## 🎓 Educational Approach

MathGenius AI is grounded in proven learning science:

- **🔄 Adaptive Learning** — Problems evolve with your skill level
- **🏆 Mastery-Based Progression** — Advance only when you're ready
- **⚡ Immediate Feedback** — Know what went wrong, and why, instantly
- **🎯 Personalized Recommendations** — Targeted practice where you need it most

---

## 🚀 Deployment

```bash
docker-compose up -d
```

---

## 👥 Team

| Member | Role |
|--------|------|
| **Sneha Tiwari** | Backend & AI Integration — FastAPI services, APIs, AI logic, database & system architecture |
| **Diksha Mitra** | Frontend Development — UI design with Next.js, Tailwind CSS & API integration |
| **Hima Agarwal** | API Integration — Frontend–backend connectivity & data flow |
| **Arpita** | AI Output & Rendering — Markdown and KaTeX formatting of AI responses |
| **Pragya Pandey** | Testing & Deployment — QA, debugging, environment setup & documentation |

---

## 📌 Future Scope

- [ ] 🔐 Authentication system
- [ ] 🐘 PostgreSQL integration
- [ ] ☁️ Cloud deployment
- [ ] 📊 Advanced analytics dashboard
- [ ] 🌍 Multi-language support

---

## 📜 License

This project is intended for **educational and research purposes**.

---

<div align="center">

Made with ❤️ by the MathGenius AI Team

</div>

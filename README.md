# 🎯 Overview

**MathGenius AI** is an AI-powered adaptive math tutoring platform designed to provide personalized learning experiences. Unlike traditional systems, it not only solves problems but also adapts explanations, generates quizzes, and tracks student performance over time.

The system combines **symbolic computation, AI-generated explanations, and adaptive learning strategies** to help students understand concepts rather than just memorize solutions.

---

# ✨ Key Features

## 🧠 Intelligent Problem Solving
- Accepts natural language math queries  
- Generates step-by-step solutions using symbolic computation  
- Provides AI-powered explanations  

## 📊 Adaptive Learning System
- Adjusts difficulty based on user performance  
- Tracks accuracy, response time, and improvement  
- Suggests next-level problems dynamically  
- Provides insights for improvement  

## ✍️ Math Rendering & Explanation
- LaTeX rendering using **KaTeX**  
- Markdown-based structured explanations  
- Clean step-by-step reasoning  

## 🎙️ Additional Features
- Speech input for problem solving  
- Syntax highlighting  
- Interactive UI with animations  

---

# 🏗️ Architecture


MathGenius-AI/
├── backend/ (FastAPI - Python)
│ ├── main.py
│ ├── database.py
│ ├── models.py
│ ├── adaptive_engine.py
│ ├── student_model.py
│ ├── solver.py
│ ├── quiz_engine.py
│ ├── routes/
│ │ ├── solve.py
│ │ ├── analytics.py
│ │ ├── quiz.py
│ │ └── users.py
│ └── utils/
│ └── llm_client.py

└── frontend/ (Next.js)
├── components/
│ ├── ProblemSolver.tsx
│ ├── QuizModule.tsx
│ ├── AnalyticsDashboard.tsx
│ └── MathDisplay.tsx
└── lib/api.ts


---

# 🚀 Tech Stack

## Frontend:
- Next.js (React + TypeScript)  
- Tailwind CSS  
- Radix UI  
- Recharts  
- KaTeX  

## Backend:
- FastAPI (Python)  
- SQLAlchemy  
- SymPy  
- LLM Integration (Groq/OpenAI)  

## Database:
- SQLite  

## Tools:
- Docker  
- Git  

---

# ⚙️ Setup Instructions

## 1️⃣ Clone the Repository

git clone https://github.com/ssnehatiwari21/MathGenius-AI.git
cd MathGenius-AI

## 2️⃣ Backend Setup

cd backend
pip install -r requirements.txt
Create .env file
👉 On Windows (PowerShell):
copy .env.example .env

Add your API key in .env
GROQ_API_KEY=your_api_key_here

Run Backend Server:
uvicorn main:app --reload

## 3️⃣ Frontend Setup
cd frontend
npm install

Create environment file
👉 Windows:
copy .env.example .env.local

Run Frontend:
npm run dev

#🔧 API Endpoints
POST /api/solve
POST /api/quiz
GET /api/analytics/{user_id}

#🧠 Core Modules
Adaptive Engine – adjusts difficulty and explanations
Student Model – tracks learning progress
Solver Engine – symbolic math solving using SymPy
Quiz Engine – dynamic quiz generation
LLM Client – handles AI explanations

#📊 Learning Metrics
Skill Score (0–100)
Accuracy Rate
Response Time
Improvement Rate
Topic-wise Breakdown

#🎓 Educational Approach
Adaptive Learning
Mastery-Based Progression
Immediate Feedback
Personalized Recommendations

#🚀 Deployment
docker-compose up -d

#👥 Team Contributions
Sneha Tiwari – Backend & AI Integration
Developed backend services using FastAPI, implemented APIs, integrated AI logic, and managed database and system architecture.
Diksha Mitra – Frontend Development
Designed and implemented UI using Next.js, Tailwind CSS, and integrated APIs.
Hima Agarwal – API Integration
Connected frontend with backend services and handled data flow.
Arpita – AI Output & Rendering
Worked on formatting AI responses using Markdown and KaTeX.
Pragya Pandey – Testing & Deployment
Performed testing, debugging, environment setup, and documentation.

#📌 Future Scope
Authentication system
PostgreSQL integration
Cloud deployment
Advanced analytics
Multi-language support

#📜 License

This project is intended for educational and research purposes.


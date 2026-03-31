# MathGenius AI - System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Component Design](#component-design)
4. [Data Flow](#data-flow)
5. [Scalability Considerations](#scalability-considerations)

## System Overview

MathGenius AI implements a **three-tier architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│              (Next.js React Application)                 │
│  - User Interface Components                            │
│  - LaTeX Rendering (KaTeX)                              │
│  - Real-time Analytics Visualization                    │
└─────────────────────────────────────────────────────────┘
                           │
                      REST API
                           │
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│                  (FastAPI Backend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Solver     │  │   Adaptive   │  │   Student    │  │
│  │   Engine     │  │   Engine     │  │   Model      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                    SQLAlchemy ORM
                           │
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│                  (SQLite Database)                       │
│  - User Profiles                                        │
│  - Question Attempts                                    │
│  - Performance Metrics                                  │
└─────────────────────────────────────────────────────────┘
```

## Architecture Patterns

### 1. Repository Pattern

Database access is abstracted through SQLAlchemy ORM, providing:
- Clean separation between business logic and data access
- Easy migration to different database backends
- Type-safe database operations

### 2. Service Layer Pattern

Core business logic is encapsulated in service classes:
- `MathSolver`: Mathematical problem solving
- `AdaptiveEngine`: Adaptive tutoring logic
- `StudentModel`: Student profiling and tracking
- `LLMClient`: External AI service integration

### 3. API Layer Pattern

RESTful API design with:
- Clear endpoint responsibilities
- Consistent request/response formats
- Proper HTTP status codes
- Error handling middleware

## Component Design

### Backend Components

#### 1. Mathematical Solver (`solver.py`)

**Purpose**: Symbolic mathematical problem solving

**Key Features**:
- Problem type classification
- Symbolic manipulation using SymPy
- Step-by-step solution generation
- LaTeX formatting for mathematical expressions

**Architecture**:
```python
class MathSolver:
    def solve_problem(problem: str, type: str) -> Dict
        ├── _classify_problem()
        ├── _solve_algebra()
        ├── _solve_calculus()
        ├── _solve_arithmetic()
        └── _solve_geometry()
```

#### 2. Adaptive Engine (`adaptive_engine.py`)

**Purpose**: Core adaptive tutoring intelligence (NOVEL COMPONENT)

**Key Features**:
- Dynamic explanation complexity determination
- Progressive hint generation
- Difficulty adjustment recommendations
- Personalized feedback generation

**Architecture**:
```python
class AdaptiveEngine:
    def determine_explanation_complexity(user_id, difficulty) -> str
    def generate_adaptive_hints(user_id, question, steps) -> List[str]
    def should_adjust_difficulty(user_id) -> Tuple[bool, str]
    def calculate_optimal_next_question(user_id) -> Dict
    def track_repeated_mistakes(user_id, question_type) -> Dict
```

**Novel Algorithm**: Complexity Modulation
```
Complexity = f(
    base_complexity,
    question_difficulty,
    student_skill_score,
    recent_performance_trend,
    response_time_pattern
)
```

#### 3. Student Model (`student_model.py`)

**Purpose**: Comprehensive student profiling (NOVEL COMPONENT)

**Key Features**:
- Multi-dimensional skill assessment
- Learning velocity calculation
- Weak area identification
- Performance trend analysis

**Architecture**:
```python
class StudentModel:
    def get_or_create_profile(user_id) -> StudentProfile
    def update_profile_after_attempt(user_id, ...) -> StudentProfile
        ├── _update_topic_score()
        ├── _update_overall_skill_score()
        ├── _update_difficulty_level()
        ├── _calculate_improvement_rate()
        └── _update_explanation_preference()
    def get_weak_areas(user_id) -> List[Dict]
    def get_performance_summary(user_id) -> Dict
```

**Novel Algorithm**: Skill Score Update
```
topic_score(t+1) = clip(
    topic_score(t) + δ * weight(difficulty),
    0, 100
)

δ = {
    +5.0  if correct
    -3.0  if incorrect
}

weight = {
    0.8   for easy
    1.0   for medium
    1.3   for hard
}
```

#### 4. LLM Integration (`utils/llm_client.py`)

**Purpose**: Natural language understanding and generation

**Key Features**:
- Provider abstraction (OpenAI/Anthropic)
- Explanation generation with complexity control
- Problem parsing and classification
- Fallback mechanisms

### Frontend Components

#### 1. Problem Solver (`ProblemSolver.tsx`)

**Purpose**: Main problem-solving interface

**Features**:
- Question input with validation
- Optional answer submission
- Real-time solution display
- Step-by-step explanation viewer
- Feedback visualization

#### 2. Analytics Dashboard (`AnalyticsDashboard.tsx`)

**Purpose**: Performance visualization and insights

**Features**:
- Performance trend charts (Recharts)
- Topic breakdown visualization
- Key metrics display
- Recent activity feed
- Personalized recommendations

#### 3. Math Display (`MathDisplay.tsx`)

**Purpose**: LaTeX rendering component

**Features**:
- Client-side KaTeX rendering
- Display and inline modes
- Error handling
- Dynamic updates

## Data Flow

### Problem Solving Flow

```
1. User Input
   ↓
2. Frontend Validation
   ↓
3. API Request (POST /api/solve)
   ↓
4. Problem Classification (LLM)
   ↓
5. Symbolic Solving (SymPy)
   ↓
6. Adaptive Complexity Determination
   ↓
7. Explanation Generation (LLM)
   ↓
8. Answer Verification (if provided)
   ↓
9. Student Profile Update
   ↓
10. Database Record Creation
   ↓
11. Response with Solution
   ↓
12. Frontend Rendering (LaTeX + UI)
```

### Adaptive Learning Flow

```
┌─────────────────────┐
│  Question Attempt   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Record Metrics:    │
│  - Correctness      │
│  - Response Time    │
│  - Question Type    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Update Skill Score │
│  (Exponential MA)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Calculate Learning │
│  Velocity (Trend)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Adjust Difficulty  │
│  Level & Complexity │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│  Generate Next      │
│  Recommendation     │
└─────────────────────┘
```

## Database Schema

### Core Entities

```sql
Users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
└── created_at

StudentProfiles
├── id (PK)
├── user_id (FK -> Users, UNIQUE)
├── overall_skill_score
├── algebra_score
├── calculus_score
├── geometry_score
├── arithmetic_score
├── difficulty_level
├── total_attempts
├── correct_attempts
├── avg_response_time
├── improvement_rate
└── preferred_explanation_depth

QuestionAttempts
├── id (PK)
├── user_id (FK -> Users)
├── topic_id (FK -> Topics)
├── question_text
├── question_type
├── difficulty
├── student_answer
├── is_correct
├── response_time
├── correct_answer
├── explanation
├── explanation_depth
├── steps (JSON)
├── skill_score_before
├── skill_score_after
├── timestamp
└── hints_used
```

### Relationships

```
User (1) ──→ (1) StudentProfile
User (1) ──→ (N) QuestionAttempts
Topic (1) ──→ (N) QuestionAttempts
```

## Scalability Considerations

### Current Architecture (MVP)

- **Frontend**: Static site, easily cacheable
- **Backend**: Single-instance FastAPI
- **Database**: SQLite (file-based)
- **Suitable for**: 1-100 concurrent users

### Production Architecture

```
                    ┌─────────────┐
                    │   CDN       │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────┴────┐       ┌────┴────┐       ┌────┴────┐
   │API Node 1│       │API Node 2│       │API Node N│
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────┴──────┐
                    │   Redis     │ (Session/Cache)
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │ PostgreSQL  │ (Primary DB)
                    └─────────────┘
```

### Scaling Strategies

1. **Horizontal Scaling**
   - Stateless API nodes
   - Session management via Redis
   - Load balancing with nginx/HAProxy

2. **Database Optimization**
   - Migrate to PostgreSQL
   - Read replicas for analytics
   - Connection pooling
   - Query optimization with indexes

3. **Caching Strategy**
   - Redis for session data
   - CDN for static assets
   - Database query caching
   - Computed metrics caching

4. **Microservices Evolution**
   ```
   Current Monolith → Split into:
   ├── User Service
   ├── Solver Service
   ├── Analytics Service
   ├── Adaptive Engine Service
   └── LLM Gateway Service
   ```

## Security Architecture

### Authentication & Authorization

- JWT-based authentication (to be implemented)
- Role-based access control
- API rate limiting
- CORS configuration

### Data Protection

- Encrypted database connections
- Secure API key storage
- Input validation and sanitization
- SQL injection prevention (ORM)

## Monitoring & Observability

### Metrics to Track

1. **Performance Metrics**
   - API response times
   - Database query times
   - LLM API latency

2. **Business Metrics**
   - Problems solved per hour
   - Average skill improvement rate
   - User engagement metrics

3. **System Metrics**
   - CPU/Memory usage
   - Database connections
   - Error rates

### Logging Strategy

```python
# Structured logging
{
    "timestamp": "2024-02-15T10:30:00Z",
    "level": "INFO",
    "service": "adaptive_engine",
    "user_id": 123,
    "action": "complexity_determination",
    "skill_score": 67.5,
    "complexity": "medium"
}
```

## Technology Choices Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Backend Framework | FastAPI | Async support, automatic API docs, type validation |
| Frontend Framework | Next.js 14 | Server components, excellent performance, TypeScript support |
| Math Engine | SymPy | Mature symbolic computation, extensive algorithms |
| Database | SQLite → PostgreSQL | Easy development start, production-ready migration path |
| LLM Integration | OpenAI/Anthropic | Best-in-class NLP capabilities |
| UI Library | Tailwind CSS | Rapid development, consistent design system |
| Math Rendering | KaTeX | Fast, server-side compatible, LaTeX support |

## Future Enhancements

1. **Real-time Collaboration**
   - WebSocket integration
   - Shared problem-solving sessions

2. **Advanced Analytics**
   - Predictive student performance
   - Automated intervention triggers
   - A/B testing framework

3. **Extended Capabilities**
   - Voice input support
   - Handwriting recognition
   - Video explanations
   - Gamification elements

4. **Research Features**
   - Experiment framework
   - A/B testing infrastructure
   - Data export for analysis
   - ML model versioning

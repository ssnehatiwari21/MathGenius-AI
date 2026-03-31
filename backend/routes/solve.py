"""
API Routes for problem solving
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict
from database import get_db
from models import QuestionAttempt, User, Topic
from student_model import StudentModel
from adaptive_engine import AdaptiveEngine
from solver import MathSolver
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from utils.llm_client import LLMClient
import time
from datetime import datetime

router = APIRouter()

class SolveRequest(BaseModel):
    user_id: int
    question: str
    question_type: Optional[str] = "auto"
    student_answer: Optional[str] = None

class SolveResponse(BaseModel):
    success: bool
    solution: str
    latex_solution: Optional[str]
    steps: List[Dict]
    explanation: str
    explanation_depth: str
    is_correct: Optional[bool] = None
    feedback: Optional[str] = None
    skill_score: float
    recommended_next: Dict

@router.post("/solve", response_model=SolveResponse)
async def solve_problem(request: SolveRequest, db: Session = Depends(get_db)):
    """
    Main solving endpoint with adaptive features
    """
    try:
        # Initialize components
        solver = MathSolver()
        adaptive_engine = AdaptiveEngine(db)
        student_model = StudentModel(db)
        llm_client = LLMClient(provider="gemini")
        
        start_time = time.time()
        
        # Get or create user
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Parse problem with LLM if needed
        parsed_info = llm_client.parse_natural_language_problem(request.question)
        
        problem_type = (
            parsed_info.get("problem_type", "algebra") 
            if parsed_info.get("success") 
            else request.question_type
        )
        
        if problem_type == "auto":
            problem_type = "algebra"
        
        # Solve the problem
        solution_result = solver.solve_problem(request.question, problem_type)
        
        if not solution_result.get("success"):
            raise HTTPException(
                status_code=400, 
                detail=f"Could not solve problem: {solution_result.get('error')}"
            )
        
        # Determine explanation complexity
        explanation_depth = adaptive_engine.determine_explanation_complexity(
            request.user_id,
            parsed_info.get("difficulty", "medium")
        )
        
        # Generate explanation
        explanation = llm_client.generate_explanation(
            request.question,
            solution_result["solution"],
            solution_result["steps"],
            explanation_depth
        )
        
        # Check if student answer is correct (if provided)
        is_correct = None
        feedback = None
        
        if request.student_answer:
            is_correct = self._check_answer(
                request.student_answer,
                solution_result["solution"]
            )
            
            feedback = adaptive_engine.generate_personalized_feedback(
                request.user_id,
                is_correct,
                problem_type
            )
        
        response_time = time.time() - start_time
        
        # Get current skill score
        profile = student_model.get_or_create_profile(request.user_id)
        skill_score_before = profile.overall_skill_score
        
        # Update student profile if answer was provided
        if request.student_answer:
            profile = student_model.update_profile_after_attempt(
                user_id=request.user_id,
                is_correct=is_correct,
                response_time=response_time,
                question_type=problem_type,
                difficulty=parsed_info.get("difficulty", "medium")
            )
            
            skill_score_after = profile.overall_skill_score
            
            # Record attempt
            attempt = QuestionAttempt(
                user_id=request.user_id,
                question_text=request.question,
                question_type=problem_type,
                difficulty=parsed_info.get("difficulty", "medium"),
                student_answer=request.student_answer,
                is_correct=is_correct,
                response_time=response_time,
                correct_answer=solution_result["solution"],
                explanation=explanation,
                explanation_depth=explanation_depth,
                steps=str(solution_result["steps"]),
                skill_score_before=skill_score_before,
                skill_score_after=skill_score_after
            )
            
            db.add(attempt)
            db.commit()
        
        # Get recommendation for next question
        recommended_next = adaptive_engine.calculate_optimal_next_question(request.user_id)
        
        return SolveResponse(
            success=True,
            solution=solution_result["solution"],
            latex_solution=solution_result.get("latex_solution"),
            steps=solution_result["steps"],
            explanation=explanation,
            explanation_depth=explanation_depth,
            is_correct=is_correct,
            feedback=feedback,
            skill_score=profile.overall_skill_score,
            recommended_next=recommended_next
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _check_answer(student_answer: str, correct_answer: str) -> bool:
    """
    Check if student answer matches correct answer
    Handles different formats and approximations
    """
    try:
        # Clean answers
        student_clean = student_answer.strip().lower()
        correct_clean = correct_answer.strip().lower()
        
        # Direct match
        if student_clean == correct_clean:
            return True
        
        # Try numerical comparison
        try:
            student_val = float(eval(student_clean))
            correct_val = float(eval(correct_clean))
            
            # Allow small tolerance
            return abs(student_val - correct_val) < 0.001
        except:
            pass
        
        # Try symbolic comparison with SymPy
        try:
            import sympy as sp
            student_expr = sp.sympify(student_clean)
            correct_expr = sp.sympify(correct_clean)
            
            return sp.simplify(student_expr - correct_expr) == 0
        except:
            pass
        
        return False
    
    except:
        return False

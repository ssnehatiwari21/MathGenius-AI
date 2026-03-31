"""
API Routes for user progress and analytics
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Optional
from database import get_db
from models import User, StudentProfile, QuestionAttempt
from student_model import StudentModel
from adaptive_engine import AdaptiveEngine
from datetime import datetime, timedelta

router = APIRouter()

class UserProgressResponse(BaseModel):
    user_id: int
    overall_skill_score: float
    difficulty_level: str
    total_attempts: int
    accuracy: float
    improvement_rate: float
    topic_scores: Dict[str, float]
    weak_areas: List[Dict]

class AnalyticsResponse(BaseModel):
    user_id: int
    performance_over_time: List[Dict]
    topic_breakdown: Dict[str, Dict]
    recent_attempts: List[Dict]
    learning_insights: Dict

class AdaptiveSettingsRequest(BaseModel):
    explanation_depth: Optional[str] = None
    difficulty_level: Optional[str] = None

@router.get("/user-progress/{user_id}", response_model=UserProgressResponse)
async def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    """
    Get comprehensive user progress information
    """
    try:
        student_model = StudentModel(db)
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get performance summary
        summary = student_model.get_performance_summary(user_id)
        
        return UserProgressResponse(**summary)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/{user_id}", response_model=AnalyticsResponse)
async def get_analytics(user_id: int, db: Session = Depends(get_db)):
    """
    Get detailed analytics and learning insights
    """
    try:
        student_model = StudentModel(db)
        adaptive_engine = AdaptiveEngine(db)
        
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get recent attempts
        attempts = db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == user_id
        ).order_by(QuestionAttempt.timestamp.desc()).limit(50).all()
        
        # Performance over time
        performance_data = []
        for attempt in reversed(attempts):
            performance_data.append({
                "timestamp": attempt.timestamp.isoformat(),
                "skill_score": attempt.skill_score_after,
                "is_correct": attempt.is_correct,
                "question_type": attempt.question_type
            })
        
        # Topic breakdown
        topic_breakdown = {}
        for topic in ["algebra", "calculus", "geometry", "arithmetic"]:
            topic_attempts = [a for a in attempts if a.question_type == topic]
            
            if topic_attempts:
                correct = sum(1 for a in topic_attempts if a.is_correct)
                total = len(topic_attempts)
                
                topic_breakdown[topic] = {
                    "total_attempts": total,
                    "correct": correct,
                    "accuracy": round((correct / total) * 100, 2),
                    "avg_response_time": round(
                        sum(a.response_time for a in topic_attempts) / total, 2
                    )
                }
        
        # Recent attempts summary
        recent_attempts = [
            {
                "question": attempt.question_text[:100] + "..." if len(attempt.question_text) > 100 else attempt.question_text,
                "type": attempt.question_type,
                "is_correct": attempt.is_correct,
                "timestamp": attempt.timestamp.isoformat(),
                "response_time": round(attempt.response_time, 2)
            }
            for attempt in attempts[:10]
        ]
        
        # Learning insights
        profile = student_model.get_or_create_profile(user_id)
        weak_areas = student_model.get_weak_areas(user_id)
        
        # Check for difficulty adjustment recommendation
        should_adjust, new_difficulty = adaptive_engine.should_adjust_difficulty(user_id)
        
        learning_insights = {
            "current_level": profile.difficulty_level,
            "recommended_difficulty": new_difficulty if should_adjust else profile.difficulty_level,
            "should_adjust_difficulty": should_adjust,
            "learning_velocity": round(profile.improvement_rate, 3),
            "focus_areas": [area["topic"] for area in weak_areas[:3]],
            "strengths": self._identify_strengths(profile),
            "study_recommendation": self._generate_study_recommendation(profile, weak_areas)
        }
        
        return AnalyticsResponse(
            user_id=user_id,
            performance_over_time=performance_data,
            topic_breakdown=topic_breakdown,
            recent_attempts=recent_attempts,
            learning_insights=learning_insights
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/adaptive-settings/{user_id}")
async def get_adaptive_settings(user_id: int, db: Session = Depends(get_db)):
    """
    Get current adaptive settings for user
    """
    try:
        adaptive_engine = AdaptiveEngine(db)
        settings = adaptive_engine.get_adaptive_settings(user_id)
        return settings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/adaptive-settings/{user_id}")
async def update_adaptive_settings(
    user_id: int,
    request: AdaptiveSettingsRequest,
    db: Session = Depends(get_db)
):
    """
    Update adaptive settings (manual override)
    """
    try:
        adaptive_engine = AdaptiveEngine(db)
        
        settings = {}
        if request.explanation_depth:
            settings["explanation_depth"] = request.explanation_depth
        if request.difficulty_level:
            settings["difficulty_level"] = request.difficulty_level
        
        profile = adaptive_engine.update_adaptive_settings(user_id, settings)
        
        return {
            "success": True,
            "message": "Settings updated",
            "new_settings": {
                "explanation_depth": profile.preferred_explanation_depth,
                "difficulty_level": profile.difficulty_level
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _identify_strengths(profile: StudentProfile) -> List[str]:
    """Identify user's strongest topics"""
    topic_scores = {
        "algebra": profile.algebra_score,
        "calculus": profile.calculus_score,
        "geometry": profile.geometry_score,
        "arithmetic": profile.arithmetic_score
    }
    
    # Get topics with score > 70
    strengths = [topic for topic, score in topic_scores.items() if score > 70]
    
    return strengths if strengths else ["developing skills"]

def _generate_study_recommendation(
    profile: StudentProfile,
    weak_areas: List[Dict]
) -> str:
    """Generate personalized study recommendation"""
    if not weak_areas:
        return "Great job! Continue practicing to maintain your skills."
    
    weakest = weak_areas[0]
    
    if profile.improvement_rate < 0:
        return f"Focus on fundamental concepts in {weakest['topic']}. Consider reviewing basic principles before attempting harder problems."
    elif profile.improvement_rate < 2:
        return f"Steady progress! Increase practice in {weakest['topic']} to build stronger foundations."
    else:
        return f"Excellent progress! Challenge yourself with advanced {weakest['topic']} problems to accelerate learning."

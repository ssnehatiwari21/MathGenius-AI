"""
Student Profiling Model - Tracks and updates student performance metrics
This is a core research component implementing cognitive profiling
"""
from sqlalchemy.orm import Session
from models import StudentProfile, QuestionAttempt, User
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

class StudentModel:
    """
    Adaptive student profiling system that tracks:
    - Performance metrics across topics
    - Skill level estimation
    - Learning velocity
    - Difficulty progression
    """
    
    def __init__(self, db: Session):
        self.db = db
        
    def get_or_create_profile(self, user_id: int) -> StudentProfile:
        """Get existing profile or create new one"""
        profile = self.db.query(StudentProfile).filter(
            StudentProfile.user_id == user_id
        ).first()
        
        if not profile:
            profile = StudentProfile(user_id=user_id)
            self.db.add(profile)
            self.db.commit()
            self.db.refresh(profile)
        
        return profile
    
    def update_profile_after_attempt(
        self, 
        user_id: int, 
        is_correct: bool,
        response_time: float,
        question_type: str,
        difficulty: str
    ) -> StudentProfile:
        """
        Update student profile after each question attempt
        Implements adaptive skill score calculation
        """
        profile = self.get_or_create_profile(user_id)
        
        # Update total attempts
        profile.total_attempts += 1
        if is_correct:
            profile.correct_attempts += 1
        
        # Update average response time (running average)
        if profile.avg_response_time == 0:
            profile.avg_response_time = response_time
        else:
            alpha = 0.3  # Smoothing factor
            profile.avg_response_time = (
                alpha * response_time + (1 - alpha) * profile.avg_response_time
            )
        
        # Update topic-specific scores
        self._update_topic_score(profile, question_type, is_correct, difficulty)
        
        # Update overall skill score
        self._update_overall_skill_score(profile)
        
        # Update difficulty level based on performance
        self._update_difficulty_level(profile)
        
        # Calculate improvement rate
        self._calculate_improvement_rate(profile, user_id)
        
        # Update explanation depth preference
        self._update_explanation_preference(profile)
        
        profile.last_updated = datetime.utcnow()
        self.db.commit()
        self.db.refresh(profile)
        
        return profile
    
    def _update_topic_score(
        self, 
        profile: StudentProfile, 
        topic: str, 
        is_correct: bool,
        difficulty: str
    ):
        """
        Update topic-specific skill score using exponential moving average
        with difficulty weighting
        """
        # Map difficulty to weight
        difficulty_weights = {
            "easy": 0.8,
            "medium": 1.0,
            "hard": 1.3
        }
        weight = difficulty_weights.get(difficulty, 1.0)
        
        # Score adjustment based on correctness
        score_delta = 5.0 * weight if is_correct else -3.0 * weight
        
        # Update topic score with bounds [0, 100]
        topic_attr = f"{topic.lower()}_score"
        if hasattr(profile, topic_attr):
            current_score = getattr(profile, topic_attr)
            new_score = np.clip(current_score + score_delta, 0, 100)
            setattr(profile, topic_attr, new_score)
    
    def _update_overall_skill_score(self, profile: StudentProfile):
        """Calculate overall skill score as weighted average of topic scores"""
        topic_scores = [
            profile.algebra_score,
            profile.calculus_score,
            profile.geometry_score,
            profile.arithmetic_score
        ]
        
        # Weighted average (can adjust weights based on importance)
        profile.overall_skill_score = np.mean(topic_scores)
    
    def _update_difficulty_level(self, profile: StudentProfile):
        """
        Adaptive difficulty progression based on performance
        Research component: Dynamic difficulty adjustment
        """
        accuracy = (
            profile.correct_attempts / profile.total_attempts 
            if profile.total_attempts > 0 else 0.5
        )
        
        skill_score = profile.overall_skill_score
        
        # Decision logic for difficulty level
        if skill_score < 40 or accuracy < 0.6:
            profile.difficulty_level = "beginner"
        elif skill_score < 70 or accuracy < 0.75:
            profile.difficulty_level = "intermediate"
        else:
            profile.difficulty_level = "advanced"
    
    def _calculate_improvement_rate(self, profile: StudentProfile, user_id: int):
        """
        Calculate learning velocity over recent attempts
        Research metric: Measures rate of skill acquisition
        """
        # Get last 20 attempts
        recent_attempts = self.db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == user_id
        ).order_by(QuestionAttempt.timestamp.desc()).limit(20).all()
        
        if len(recent_attempts) < 5:
            profile.improvement_rate = 0.0
            return
        
        # Calculate trend in skill scores
        skill_scores = [
            attempt.skill_score_after 
            for attempt in reversed(recent_attempts) 
            if attempt.skill_score_after is not None
        ]
        
        if len(skill_scores) < 2:
            profile.improvement_rate = 0.0
            return
        
        # Linear regression for trend
        x = np.arange(len(skill_scores))
        slope, _ = np.polyfit(x, skill_scores, 1)
        
        profile.improvement_rate = float(slope)
    
    def _update_explanation_preference(self, profile: StudentProfile):
        """
        Adapt explanation depth based on skill level
        Core adaptive feature
        """
        if profile.overall_skill_score < 40:
            profile.preferred_explanation_depth = "detailed"
        elif profile.overall_skill_score < 70:
            profile.preferred_explanation_depth = "medium"
        else:
            profile.preferred_explanation_depth = "concise"
    
    def get_weak_areas(self, user_id: int, limit: int = 5) -> List[Dict]:
        """
        Identify topics where student needs improvement
        Returns sorted list of weak areas
        """
        profile = self.get_or_create_profile(user_id)
        
        topic_performance = {
            "algebra": profile.algebra_score,
            "calculus": profile.calculus_score,
            "geometry": profile.geometry_score,
            "arithmetic": profile.arithmetic_score
        }
        
        # Sort by score (ascending) to get weakest areas
        weak_areas = sorted(
            topic_performance.items(), 
            key=lambda x: x[1]
        )[:limit]
        
        return [
            {
                "topic": topic,
                "score": score,
                "status": "needs_improvement" if score < 60 else "developing"
            }
            for topic, score in weak_areas
        ]
    
    def get_performance_summary(self, user_id: int) -> Dict:
        """Get comprehensive performance summary"""
        profile = self.get_or_create_profile(user_id)
        
        accuracy = (
            profile.correct_attempts / profile.total_attempts 
            if profile.total_attempts > 0 else 0
        )
        
        return {
            "user_id": user_id,
            "overall_skill_score": round(profile.overall_skill_score, 2),
            "difficulty_level": profile.difficulty_level,
            "total_attempts": profile.total_attempts,
            "accuracy": round(accuracy * 100, 2),
            "improvement_rate": round(profile.improvement_rate, 3),
            "avg_response_time": round(profile.avg_response_time, 2),
            "topic_scores": {
                "algebra": round(profile.algebra_score, 2),
                "calculus": round(profile.calculus_score, 2),
                "geometry": round(profile.geometry_score, 2),
                "arithmetic": round(profile.arithmetic_score, 2)
            },
            "preferred_explanation_depth": profile.preferred_explanation_depth,
            "weak_areas": self.get_weak_areas(user_id)
        }

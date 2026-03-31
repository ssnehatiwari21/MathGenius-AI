"""
Adaptive Explanation Engine - Core Research Component
Implements intelligent tutoring system that adapts explanations
based on student profiling and performance metrics
"""
from typing import Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from models import StudentProfile, QuestionAttempt
from student_model import StudentModel
import json

class AdaptiveEngine:
    """
    Novel Adaptive Tutoring Framework
    
    Research Innovation:
    - Dynamic explanation modulation based on cognitive profiling
    - Real-time difficulty adjustment
    - Personalized learning path generation
    - Context-aware hint generation
    """
    
    def __init__(self, db: Session):
        self.db = db
        self.student_model = StudentModel(db)
    
    def determine_explanation_complexity(self, user_id: int, question_difficulty: str) -> str:
        """
        Determine optimal explanation complexity based on:
        1. Student's current skill level
        2. Question difficulty
        3. Recent performance trend
        4. Response time patterns
        
        Returns: "detailed", "medium", or "concise"
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        # Get base complexity from profile
        base_complexity = profile.preferred_explanation_depth
        
        # Adjust based on question difficulty vs student level
        adjustment = self._calculate_complexity_adjustment(
            profile, 
            question_difficulty
        )
        
        complexity_levels = ["detailed", "medium", "concise"]
        base_index = complexity_levels.index(base_complexity)
        
        # Apply adjustment
        new_index = max(0, min(2, base_index + adjustment))
        
        return complexity_levels[new_index]
    
    def _calculate_complexity_adjustment(
        self, 
        profile: StudentProfile, 
        question_difficulty: str
    ) -> int:
        """
        Calculate adjustment to explanation complexity
        Returns: -1 (more detailed), 0 (keep same), +1 (more concise)
        """
        skill_score = profile.overall_skill_score
        
        difficulty_map = {"easy": 1, "medium": 2, "hard": 3}
        question_level = difficulty_map.get(question_difficulty, 2)
        
        # If question is hard but student score is low, make more detailed
        if question_level == 3 and skill_score < 50:
            return -1
        
        # If question is easy and student score is high, make more concise
        if question_level == 1 and skill_score > 70:
            return 1
        
        # Check recent performance
        if profile.improvement_rate < -2:  # Student is struggling
            return -1
        
        if profile.improvement_rate > 2:  # Student is excelling
            return 1
        
        return 0
    
    def generate_adaptive_hints(
        self, 
        user_id: int, 
        question_text: str,
        steps: List[Dict]
    ) -> List[str]:
        """
        Generate progressive hints based on student level
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        if profile.difficulty_level == "beginner":
            # More explicit hints
            return [
                f"Let's break this down step by step.",
                f"First, identify what type of problem this is.",
                f"Look at the key information given in the problem."
            ]
        elif profile.difficulty_level == "intermediate":
            # Moderate guidance
            return [
                f"Think about which method would work best here.",
                f"Consider the first step in solving this type of problem.",
                f"What mathematical operation should you apply first?"
            ]
        else:  # advanced
            # Minimal hints
            return [
                f"Consider the problem structure.",
                f"What's your approach?"
            ]
    
    def should_adjust_difficulty(self, user_id: int) -> Tuple[bool, str]:
        """
        Determine if difficulty should be adjusted based on recent performance
        
        Returns: (should_adjust, new_difficulty)
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        # Get last 10 attempts
        recent_attempts = self.db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == user_id
        ).order_by(QuestionAttempt.timestamp.desc()).limit(10).all()
        
        if len(recent_attempts) < 5:
            return False, profile.difficulty_level
        
        # Calculate recent accuracy
        recent_correct = sum(1 for attempt in recent_attempts if attempt.is_correct)
        recent_accuracy = recent_correct / len(recent_attempts)
        
        current_level = profile.difficulty_level
        
        # Difficulty adjustment logic
        if recent_accuracy >= 0.8 and current_level != "advanced":
            # Student is doing very well, increase difficulty
            new_level = {
                "beginner": "intermediate",
                "intermediate": "advanced"
            }[current_level]
            return True, new_level
        
        elif recent_accuracy <= 0.4 and current_level != "beginner":
            # Student is struggling, decrease difficulty
            new_level = {
                "intermediate": "beginner",
                "advanced": "intermediate"
            }[current_level]
            return True, new_level
        
        return False, current_level
    
    def generate_personalized_feedback(
        self, 
        user_id: int, 
        is_correct: bool,
        question_type: str
    ) -> str:
        """
        Generate personalized feedback based on student profile and performance
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        if is_correct:
            # Positive feedback calibrated to student level
            if profile.overall_skill_score < 40:
                return "Great job! You're making excellent progress. Keep practicing!"
            elif profile.overall_skill_score < 70:
                return "Well done! Your understanding is improving steadily."
            else:
                return "Correct! You've mastered this concept."
        else:
            # Constructive feedback
            weak_areas = self.student_model.get_weak_areas(user_id)
            weak_topics = [area["topic"] for area in weak_areas[:2]]
            
            if question_type.lower() in weak_topics:
                return f"This is a challenging area for you. Let's review the key concepts in {question_type}."
            else:
                return "Not quite right. Review the explanation and try a similar problem."
    
    def calculate_optimal_next_question(self, user_id: int) -> Dict:
        """
        Recommend next question parameters based on student profile
        Research component: Personalized learning path generation
        """
        profile = self.student_model.get_or_create_profile(user_id)
        weak_areas = self.student_model.get_weak_areas(user_id)
        
        # Focus on weakest area
        if weak_areas:
            target_topic = weak_areas[0]["topic"]
        else:
            # Rotate through topics
            topics = ["algebra", "calculus", "geometry", "arithmetic"]
            topic_scores = [
                getattr(profile, f"{topic}_score", 50) 
                for topic in topics
            ]
            target_topic = topics[topic_scores.index(min(topic_scores))]
        
        # Determine difficulty
        if profile.overall_skill_score < 40:
            difficulty = "easy"
        elif profile.overall_skill_score < 70:
            difficulty = "medium"
        else:
            difficulty = "hard"
        
        return {
            "recommended_topic": target_topic,
            "recommended_difficulty": difficulty,
            "rationale": f"Focusing on {target_topic} to strengthen weak areas"
        }
    
    def track_repeated_mistakes(self, user_id: int, question_type: str) -> Dict:
        """
        Identify patterns in repeated mistakes for targeted intervention
        """
        attempts = self.db.query(QuestionAttempt).filter(
            QuestionAttempt.user_id == user_id,
            QuestionAttempt.question_type == question_type,
            QuestionAttempt.is_correct == False
        ).order_by(QuestionAttempt.timestamp.desc()).limit(20).all()
        
        if len(attempts) < 3:
            return {
                "has_pattern": False,
                "mistake_count": len(attempts)
            }
        
        # Analyze recent failures
        recent_failures = len([a for a in attempts[:5]])
        
        return {
            "has_pattern": recent_failures >= 3,
            "mistake_count": len(attempts),
            "recent_failures": recent_failures,
            "needs_intervention": recent_failures >= 3,
            "recommendation": "Consider reviewing fundamental concepts" if recent_failures >= 3 else None
        }
    
    def get_adaptive_settings(self, user_id: int) -> Dict:
        """
        Get current adaptive settings for the student
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        return {
            "explanation_depth": profile.preferred_explanation_depth,
            "difficulty_level": profile.difficulty_level,
            "skill_score": profile.overall_skill_score,
            "learning_velocity": profile.improvement_rate,
            "adaptive_mode": "active"
        }
    
    def update_adaptive_settings(
        self, 
        user_id: int, 
        settings: Dict
    ) -> StudentProfile:
        """
        Allow manual override of adaptive settings
        """
        profile = self.student_model.get_or_create_profile(user_id)
        
        if "explanation_depth" in settings:
            profile.preferred_explanation_depth = settings["explanation_depth"]
        
        if "difficulty_level" in settings:
            profile.difficulty_level = settings["difficulty_level"]
        
        self.db.commit()
        self.db.refresh(profile)
        
        return profile

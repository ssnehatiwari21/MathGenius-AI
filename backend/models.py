"""
Database models for MathGenius AI
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    attempts = relationship("QuestionAttempt", back_populates="user")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Skill metrics
    overall_skill_score = Column(Float, default=50.0)  # 0-100 scale
    algebra_score = Column(Float, default=50.0)
    calculus_score = Column(Float, default=50.0)
    geometry_score = Column(Float, default=50.0)
    arithmetic_score = Column(Float, default=50.0)
    
    # Difficulty level
    difficulty_level = Column(String, default="intermediate")  # beginner, intermediate, advanced
    
    # Performance metrics
    total_attempts = Column(Integer, default=0)
    correct_attempts = Column(Integer, default=0)
    avg_response_time = Column(Float, default=0.0)  # in seconds
    improvement_rate = Column(Float, default=0.0)
    
    # Adaptive settings
    preferred_explanation_depth = Column(String, default="medium")  # detailed, medium, concise
    
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profile")

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String)  # algebra, calculus, geometry, arithmetic
    difficulty = Column(String)  # easy, medium, hard
    
    # Relationships
    attempts = relationship("QuestionAttempt", back_populates="topic")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    
    # Question details
    question_text = Column(Text)
    question_type = Column(String)  # algebra, calculus, geometry, arithmetic
    difficulty = Column(String)  # easy, medium, hard
    
    # Student response
    student_answer = Column(Text, nullable=True)
    is_correct = Column(Boolean, default=False)
    response_time = Column(Float)  # in seconds
    
    # System response
    correct_answer = Column(Text)
    explanation = Column(Text)
    explanation_depth = Column(String)  # detailed, medium, concise
    steps = Column(Text)  # JSON format
    
    # Adaptive metrics
    skill_score_before = Column(Float)
    skill_score_after = Column(Float)
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)
    hints_used = Column(Integer, default=0)
    
    # Relationships
    user = relationship("User", back_populates="attempts")
    topic = relationship("Topic", back_populates="attempts")

class WeakArea(Base):
    __tablename__ = "weak_areas"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    topic_name = Column(String)
    accuracy = Column(Float)
    attempt_count = Column(Integer)
    last_attempt = Column(DateTime, default=datetime.utcnow)
class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Chat")
    messages = relationship("Message", back_populates="chat")

class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    chat = relationship("Chat", back_populates="messages")
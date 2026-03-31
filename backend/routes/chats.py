"""Chat routes for MathGenius AI"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Chat, Message
from pydantic import BaseModel
from typing import Optional
from utils.llm_client import LLMClient
import json

router = APIRouter()

class ChatCreate(BaseModel):
    title: str
    forceCreate: Optional[bool] = False

class ChatRename(BaseModel):
    title: str

class ChatMessage(BaseModel):
    content: Optional[str] = None
    file_ids: Optional[list] = []

@router.post("/chats")
def create_chat(body: ChatCreate, db: Session = Depends(get_db)):
    chat = Chat(title=body.title)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

@router.get("/chats")
def get_chats(db: Session = Depends(get_db)):
    return db.query(Chat).order_by(Chat.id.desc()).all()

@router.get("/chats/{chat_id}")
def get_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat

@router.delete("/chats/{chat_id}", status_code=204)
def delete_chat(chat_id: int, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()

@router.patch("/chats/{chat_id}")
def rename_chat(chat_id: int, body: ChatRename, db: Session = Depends(get_db)):
    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    chat.title = body.title
    db.commit()
    db.refresh(chat)
    return chat

@router.post("/chats/{chat_id}/reset-context")
def reset_context(chat_id: int):
    return {"status": "ok"}

@router.post("/chats/{chat_id}/interrupt")
def interrupt_generation(chat_id: int, generation_id: str):
    return {"status": "interrupted"}

@router.post("/chat")
async def chat(body: ChatMessage):
    """Streaming chat endpoint for math tutoring"""

    if not body.content:
        raise HTTPException(status_code=400, detail="No message content provided")

    llm_client = LLMClient(provider="groq")

    if not llm_client.client:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")

    async def generate():
        try:
            full_text = llm_client.generate_chat(body.content)

            chunk_size = 30
            for i in range(0, len(full_text), chunk_size):
                chunk = full_text[i:i+chunk_size]
                data = json.dumps({"text": chunk})
                yield f"data: {data}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
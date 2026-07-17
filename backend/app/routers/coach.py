from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, ChatHistory
from ..auth.security import get_current_user
from ..schemas import ChatRequest
from ..services.ai_service import AIService
from pydantic import BaseModel
from typing import List

router = APIRouter()

class ChatMessageResponse(BaseModel):
    role: str
    content: str

    class Config:
        from_attributes = True

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp).all()
    # Add a default message if none exists
    if not history:
        return [{"role": "assistant", "content": "Hi! I'm your FitPilot Coach. How can I help you reach your fitness goals today?"}]
    return history

@router.post("/chat")
def chat_with_coach(request: ChatRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = {
        "goal": current_user.goal,
        "weight": current_user.weight,
        "height": current_user.height,
        "age": current_user.age
    }
    
    # Save User Message
    user_msg = ChatHistory(user_id=current_user.id, role="user", content=request.message)
    db.add(user_msg)
    
    # Load History
    history = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).order_by(ChatHistory.timestamp).all()
    formatted_history = [{"role": msg.role, "parts": [msg.content]} for msg in history]
    
    # Generate Response
    response_text = AIService.get_fitness_coach_response(
        user_profile=profile,
        message_history=formatted_history,
        new_message=request.message
    )
    
    # Save Assistant Message
    assistant_msg = ChatHistory(user_id=current_user.id, role="assistant", content=response_text)
    db.add(assistant_msg)
    db.commit()
    
    return {"response": response_text}

@router.delete("/history")
def clear_chat_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class DraftCreate(BaseModel):
    customer_id: Optional[int] = None
    order_id: Optional[int] = None
    draft_data: Dict[str, Any]

class DraftUpdate(BaseModel):
    customer_id: Optional[int] = None
    order_id: Optional[int] = None
    draft_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None # DRAFT, CONFIRMED, CANCELLED

class DraftResponse(BaseModel):
    id: int
    user_id: int
    customer_id: Optional[int] = None
    order_id: Optional[int] = None
    draft_data: Dict[str, Any]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

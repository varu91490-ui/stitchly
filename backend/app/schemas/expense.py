from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class ExpenseCreate(BaseModel):
    category: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)
    amount: Decimal = Field(..., gt=0)
    expense_date: Optional[datetime] = None
    notes: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: int
    user_id: int
    category: str
    description: Optional[str] = None
    amount: Decimal
    expense_date: datetime
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

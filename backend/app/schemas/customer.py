from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=150)
    phone: Optional[str] = Field(None, max_length=30)
    notes: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    total_order_value: Decimal = Decimal("0.00")
    total_paid: Decimal = Decimal("0.00")
    outstanding_balance: Decimal = Decimal("0.00")
    orders_count: int = 0

    class Config:
        from_attributes = True

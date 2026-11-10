from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class PaymentCreate(BaseModel):
    customer_id: int
    order_id: Optional[int] = None
    amount: Decimal = Field(..., gt=0)
    payment_method: str = Field("CASH", pattern="^(CASH|UPI|OTHER)$")
    payment_type: str = Field("PARTIAL", pattern="^(ADVANCE|PARTIAL|FULL|CORRECTION|REFUND)$")
    payment_date: Optional[datetime] = None
    notes: Optional[str] = None

class PaymentCorrection(BaseModel):
    corrected_amount: Decimal = Field(..., gt=0)
    reason: str = Field(..., min_length=3)
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    customer_name: Optional[str] = None
    order_id: Optional[int] = None
    amount: Decimal
    payment_method: str
    payment_date: datetime
    payment_type: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

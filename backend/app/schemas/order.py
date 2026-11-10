from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field

class OrderItemBase(BaseModel):
    garment_name: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(1, ge=1)
    unit_price: Decimal = Field(Decimal("0.00"), ge=0)
    line_total: Decimal = Field(Decimal("0.00"), ge=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    customer_id: int
    pricing_mode: str = Field("GARMENT_WISE", pattern="^(GARMENT_WISE|COMBINED)$")
    total_amount: Optional[Decimal] = Field(None, ge=0)
    items: List[OrderItemCreate] = []
    expected_delivery_date: Optional[datetime] = None
    advance_amount: Optional[Decimal] = Field(None, ge=0)
    payment_method: Optional[str] = "CASH"
    notes: Optional[str] = None

class OrderUpdate(BaseModel):
    expected_delivery_date: Optional[datetime] = None
    status: Optional[str] = Field(None, pattern="^(NEW|IN_PROGRESS|READY|DELIVERED|CANCELLED)$")
    total_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    customer_id: int
    customer_name: Optional[str] = None
    order_date: datetime
    expected_delivery_date: Optional[datetime] = None
    status: str
    pricing_mode: str
    total_amount: Decimal
    paid_amount: Decimal = Decimal("0.00")
    remaining_balance: Decimal = Decimal("0.00")
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

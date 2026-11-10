from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, Field

class ExtractedGarment(BaseModel):
    garment_name: str
    quantity: int = 1
    unit_price: Optional[Decimal] = None
    line_total: Optional[Decimal] = None

class VoiceParseRequest(BaseModel):
    transcript: str = Field(..., min_length=1)
    draft_id: Optional[int] = None

class MatchedCustomer(BaseModel):
    id: int
    name: str
    phone: Optional[str] = None
    outstanding_balance: Decimal = Decimal("0.00")

class VoiceParseResponse(BaseModel):
    original_transcript: str
    intent: str # NEW_ORDER, ADD_GARMENTS, SET_PRICE, RECORD_PAYMENT, SET_DELIVERY, GENERAL_RECORD
    customer_name: Optional[str] = None
    customer_id: Optional[int] = None
    matched_customers: List[MatchedCustomer] = []
    is_ambiguous_customer: bool = False
    garments: List[ExtractedGarment] = []
    total_amount: Optional[Decimal] = None
    advance_amount: Optional[Decimal] = None
    delivery_date: Optional[str] = None
    missing_fields: List[str] = []
    draft_id: Optional[int] = None
    kannada_summary: str

class VoiceQueryRequest(BaseModel):
    query: str = Field(..., min_length=1)

class VoiceQueryResponse(BaseModel):
    query: str
    intent: str
    kannada_response: str
    data: Optional[Dict[str, Any]] = None

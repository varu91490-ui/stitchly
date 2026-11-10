from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentCorrection, PaymentResponse
from app.services.payment_service import PaymentService
from app.api.deps import get_current_user

router = APIRouter()

def format_payment_response(p: Payment) -> PaymentResponse:
    return PaymentResponse(
        id=p.id,
        user_id=p.user_id,
        customer_id=p.customer_id,
        customer_name=p.customer.name if p.customer else None,
        order_id=p.order_id,
        amount=p.amount,
        payment_method=p.payment_method,
        payment_date=p.payment_date,
        payment_type=p.payment_type,
        notes=p.notes,
        created_at=p.created_at
    )

@router.get("/", response_model=List[PaymentResponse])
def list_payments(
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    order_id: Optional[int] = Query(None, description="Filter by order ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payments = PaymentService.list_payments(
        db, current_user.id,
        customer_id=customer_id,
        order_id=order_id,
        skip=skip,
        limit=limit
    )
    return [format_payment_response(p) for p in payments]

@router.post("/", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment_in: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        payment = PaymentService.create_payment(db, current_user.id, payment_in)
        return format_payment_response(payment)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{payment_id}/correct", response_model=PaymentResponse)
def correct_payment(
    payment_id: int,
    correction: PaymentCorrection,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        updated = PaymentService.correct_payment(db, payment_id, current_user.id, correction)
        return format_payment_response(updated)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

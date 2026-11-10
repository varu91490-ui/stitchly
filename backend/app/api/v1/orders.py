from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderItemResponse
from app.services.order_service import OrderService
from app.api.deps import get_current_user

router = APIRouter()

def format_order_response(db: Session, order: Order) -> OrderResponse:
    paid, remaining = OrderService.calculate_order_financials(db, order.id)
    items_resp = [
        OrderItemResponse(
            id=item.id,
            order_id=item.order_id,
            garment_name=item.garment_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            line_total=item.line_total,
            created_at=item.created_at
        )
        for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        user_id=order.user_id,
        customer_id=order.customer_id,
        customer_name=order.customer.name if order.customer else None,
        order_date=order.order_date,
        expected_delivery_date=order.expected_delivery_date,
        status=order.status,
        pricing_mode=order.pricing_mode,
        total_amount=order.total_amount,
        paid_amount=paid,
        remaining_balance=remaining,
        notes=order.notes,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=items_resp
    )

@router.get("/", response_model=List[OrderResponse])
def list_orders(
    status: Optional[str] = Query(None, description="Status filter: NEW, IN_PROGRESS, READY, DELIVERED, CANCELLED"),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    delivery_filter: Optional[str] = Query(None, description="today, tomorrow, overdue, upcoming"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    orders = OrderService.list_orders(
        db, current_user.id,
        status=status,
        customer_id=customer_id,
        delivery_filter=delivery_filter,
        skip=skip,
        limit=limit
    )
    return [format_order_response(db, o) for o in orders]

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        order = OrderService.create_order(db, current_user.id, order_in)
        return format_order_response(db, order)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = OrderService.get_order_by_id(db, order_id, current_user.id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ (Order not found)"
        )
    return format_order_response(db, order)

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_in: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = OrderService.get_order_by_id(db, order_id, current_user.id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ (Order not found)"
        )
    updated = OrderService.update_order(db, order, order_in)
    return format_order_response(db, updated)

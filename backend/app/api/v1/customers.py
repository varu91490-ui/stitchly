from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services.customer_service import CustomerService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CustomerResponse])
def list_customers(
    q: Optional[str] = Query(None, description="Search query by name or phone"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customers = CustomerService.search_customers(db, current_user.id, query=q or "", skip=skip, limit=limit)
    response = []
    for c in customers:
        tot_orders, tot_paid, bal, count = CustomerService.calculate_customer_financials(db, c.id, current_user.id)
        response.append(CustomerResponse(
            id=c.id,
            user_id=c.user_id,
            name=c.name,
            phone=c.phone,
            notes=c.notes,
            created_at=c.created_at,
            updated_at=c.updated_at,
            total_order_value=tot_orders,
            total_paid=tot_paid,
            outstanding_balance=bal,
            orders_count=count
        ))
    return response

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = CustomerService.create_customer(db, current_user.id, customer_in)
    return CustomerResponse(
        id=customer.id,
        user_id=customer.user_id,
        name=customer.name,
        phone=customer.phone,
        notes=customer.notes,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_order_value=Decimal("0.00"),
        total_paid=Decimal("0.00"),
        outstanding_balance=Decimal("0.00"),
        orders_count=0
    )

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = CustomerService.get_customer_by_id(db, customer_id, current_user.id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ (Customer not found)"
        )
    tot_orders, tot_paid, bal, count = CustomerService.calculate_customer_financials(db, customer.id, current_user.id)
    return CustomerResponse(
        id=customer.id,
        user_id=customer.user_id,
        name=customer.name,
        phone=customer.phone,
        notes=customer.notes,
        created_at=customer.created_at,
        updated_at=customer.updated_at,
        total_order_value=tot_orders,
        total_paid=tot_paid,
        outstanding_balance=bal,
        orders_count=count
    )

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    customer_in: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = CustomerService.get_customer_by_id(db, customer_id, current_user.id)
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ (Customer not found)"
        )
    updated = CustomerService.update_customer(db, customer, customer_in)
    tot_orders, tot_paid, bal, count = CustomerService.calculate_customer_financials(db, updated.id, current_user.id)
    return CustomerResponse(
        id=updated.id,
        user_id=updated.user_id,
        name=updated.name,
        phone=updated.phone,
        notes=updated.notes,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        total_order_value=tot_orders,
        total_paid=tot_paid,
        outstanding_balance=bal,
        orders_count=count
    )

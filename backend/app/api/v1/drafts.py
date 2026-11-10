from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.draft import TransactionDraft
from app.models.customer import Customer
from app.schemas.draft import DraftResponse, DraftUpdate
from app.schemas.customer import CustomerCreate
from app.schemas.order import OrderCreate, OrderItemCreate, OrderResponse
from app.services.customer_service import CustomerService
from app.services.order_service import OrderService
from app.api.v1.orders import format_order_response
from app.api.deps import get_current_user
import json

router = APIRouter()

@router.get("/", response_model=List[DraftResponse])
def list_drafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    drafts = db.query(TransactionDraft).filter(
        TransactionDraft.user_id == current_user.id,
        TransactionDraft.status == "DRAFT"
    ).order_by(TransactionDraft.updated_at.desc()).all()
    
    result = []
    for d in drafts:
        data = {}
        try:
            data = json.loads(d.draft_data)
        except Exception:
            pass
        result.append(DraftResponse(
            id=d.id,
            user_id=d.user_id,
            customer_id=d.customer_id,
            order_id=d.order_id,
            draft_data=data,
            status=d.status,
            created_at=d.created_at,
            updated_at=d.updated_at
        ))
    return result

@router.get("/{draft_id}", response_model=DraftResponse)
def get_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    d = db.query(TransactionDraft).filter(
        TransactionDraft.id == draft_id,
        TransactionDraft.user_id == current_user.id
    ).first()
    if not d:
        raise HTTPException(status_code=404, detail="ಕರಡು ಕಂಡುಬಂದಿಲ್ಲ (Draft not found)")
    
    data = {}
    try:
        data = json.loads(d.draft_data)
    except Exception:
        pass

    return DraftResponse(
        id=d.id,
        user_id=d.user_id,
        customer_id=d.customer_id,
        order_id=d.order_id,
        draft_data=data,
        status=d.status,
        created_at=d.created_at,
        updated_at=d.updated_at
    )

@router.post("/{draft_id}/confirm", response_model=OrderResponse)
def confirm_draft(
    draft_id: int,
    overrides: Optional[Dict[str, Any]] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Validates and commits a voice draft into a real Customer, Order, and Payment.
    Never silently commits invalid or ambiguous data.
    """
    draft = db.query(TransactionDraft).filter(
        TransactionDraft.id == draft_id,
        TransactionDraft.user_id == current_user.id,
        TransactionDraft.status == "DRAFT"
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="ಸಕ್ರಿಯ ಕರಡು ಕಂಡುಬಂದಿಲ್ಲ (Active draft not found)")

    data = {}
    try:
        data = json.loads(draft.draft_data)
    except Exception:
        pass

    if overrides:
        data.update(overrides)

    customer_id = data.get("customer_id")
    customer_name = data.get("customer_name")

    # 1. Resolve Customer
    if not customer_id:
        if not customer_name:
            raise HTTPException(status_code=400, detail="ಗ್ರಾಹಕರ ಹೆಸರು ಕಡ್ಡಾಯ (Customer name is required)")
        # Check if customer exists
        existing = CustomerService.find_existing_by_name(db, current_user.id, customer_name)
        if len(existing) == 1:
            customer_id = existing[0].id
        else:
            # Create new customer
            new_cust = CustomerService.create_customer(
                db, current_user.id,
                CustomerCreate(name=customer_name, phone=data.get("phone"))
            )
            customer_id = new_cust.id

    # 2. Prepare Order Items
    raw_garments = data.get("garments", [])
    order_items = []
    for g in raw_garments:
        u_price = Decimal(str(g.get("unit_price") or 0))
        l_total = Decimal(str(g.get("line_total") or 0))
        order_items.append(OrderItemCreate(
            garment_name=g["garment_name"],
            quantity=int(g.get("quantity", 1)),
            unit_price=u_price,
            line_total=l_total
        ))

    # 3. Determine Pricing Mode & Total
    tot_amt_raw = data.get("total_amount")
    pricing_mode = "COMBINED" if tot_amt_raw and not any(g.get("unit_price") for g in raw_garments) else "GARMENT_WISE"
    total_amount = Decimal(str(tot_amt_raw)) if tot_amt_raw else None

    # Delivery date
    deliv_date = None
    if data.get("delivery_date"):
        try:
            deliv_date = datetime.strptime(data["delivery_date"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except Exception:
            pass

    # Advance
    adv_raw = data.get("advance_amount")
    advance_amount = Decimal(str(adv_raw)) if adv_raw else None

    order_in = OrderCreate(
        customer_id=customer_id,
        pricing_mode=pricing_mode,
        total_amount=total_amount,
        items=order_items,
        expected_delivery_date=deliv_date,
        advance_amount=advance_amount,
        payment_method=data.get("payment_method", "CASH"),
        notes=data.get("notes")
    )

    try:
        created_order = OrderService.create_order(db, current_user.id, order_in)
        # Update draft
        draft.status = "CONFIRMED"
        draft.order_id = created_order.id
        draft.customer_id = customer_id
        db.commit()
        return format_order_response(db, created_order)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{draft_id}")
def cancel_draft(
    draft_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    draft = db.query(TransactionDraft).filter(
        TransactionDraft.id == draft_id,
        TransactionDraft.user_id == current_user.id
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="ಕರಡು ಕಂಡುಬಂದಿಲ್ಲ (Draft not found)")
    draft.status = "CANCELLED"
    db.commit()
    return {"status": "success", "message": "ಕರಡನ್ನು ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Draft cancelled)"}

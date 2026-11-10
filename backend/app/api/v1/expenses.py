from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.services.expense_service import ExpenseService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ExpenseResponse])
def list_expenses(
    category: Optional[str] = Query(None, description="Category filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = ExpenseService.list_expenses(db, current_user.id, category=category, skip=skip, limit=limit)
    return expenses

@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ExpenseService.create_expense(db, current_user.id, expense_in)

@router.get("/summary")
def get_expense_summary(
    month: Optional[int] = Query(None),
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    target_year = year or now.year
    target_month = month or now.month
    import calendar
    _, last_day = calendar.monthrange(target_year, target_month)
    start_dt = datetime(target_year, target_month, 1, 0, 0, 0, tzinfo=timezone.utc)
    end_dt = datetime(target_year, target_month, last_day, 23, 59, 59, tzinfo=timezone.utc)

    return ExpenseService.get_expense_summary(db, current_user.id, start_dt, end_dt)

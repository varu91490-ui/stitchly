from decimal import Decimal
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.expense import Expense
from app.models.payment import Payment
from app.models.audit import AuditLog
from app.schemas.expense import ExpenseCreate
import json

class ExpenseService:
    @staticmethod
    def create_expense(db: Session, user_id: int, expense_in: ExpenseCreate) -> Expense:
        expense = Expense(
            user_id=user_id,
            category=expense_in.category.strip(),
            description=expense_in.description.strip() if expense_in.description else None,
            amount=expense_in.amount,
            expense_date=expense_in.expense_date or datetime.now(timezone.utc),
            notes=expense_in.notes
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)

        audit = AuditLog(
            user_id=user_id,
            entity_type="expense",
            entity_id=expense.id,
            action="CREATE",
            new_data=json.dumps({
                "category": expense.category,
                "amount": str(expense.amount),
                "description": expense.description
            })
        )
        db.add(audit)
        db.commit()
        return expense

    @staticmethod
    def list_expenses(
        db: Session,
        user_id: int,
        category: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Expense]:
        q = db.query(Expense).filter(Expense.user_id == user_id)
        if category:
            q = q.filter(Expense.category == category)
        if start_date:
            q = q.filter(Expense.expense_date >= start_date)
        if end_date:
            q = q.filter(Expense.expense_date <= end_date)
        return q.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def get_expense_summary(db: Session, user_id: int, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Returns total expenses and breakdown by category in given timeframe."""
        total_val = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date
        ).scalar()
        total_expense = Decimal(str(total_val))

        # Category breakdown
        breakdown = db.query(
            Expense.category,
            func.coalesce(func.sum(Expense.amount), 0).label("cat_total"),
            func.count(Expense.id).label("count")
        ).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date
        ).group_by(Expense.category).all()

        cat_list = [
            {"category": b[0], "total": Decimal(str(b[1])), "count": b[2]}
            for b in breakdown
        ]

        return {
            "total_expense": total_expense,
            "category_breakdown": cat_list
        }

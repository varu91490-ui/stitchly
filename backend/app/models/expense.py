from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False) # e.g. ವಿದ್ಯುತ್, ಬಾಡಿಗೆ, ದಾರ ಮತ್ತು ಸಾಮಗ್ರಿಗಳು, ಯಂತ್ರ ರಿಪೇರಿ, ಇತರೆ
    description = Column(String(255), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    expense_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="expenses")

    __table_args__ = (
        Index("idx_expense_user_date", "user_id", "expense_date"),
    )

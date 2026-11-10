from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_method = Column(String(50), default="CASH", nullable=False) # CASH, UPI, OTHER
    payment_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    payment_type = Column(String(50), default="PARTIAL", nullable=False) # ADVANCE, PARTIAL, FULL, CORRECTION, REFUND
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="payments")
    customer = relationship("Customer", back_populates="payments")
    order = relationship("Order", back_populates="payments")

    __table_args__ = (
        Index("idx_payment_user_date", "user_id", "payment_date"),
    )

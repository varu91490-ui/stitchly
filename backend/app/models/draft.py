from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class TransactionDraft(Base):
    __tablename__ = "transaction_drafts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True, index=True)
    draft_data = Column(Text, nullable=False) # JSON encoded data
    status = Column(String(50), default="DRAFT", nullable=False) # DRAFT, CONFIRMED, CANCELLED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="drafts")
    customer = relationship("Customer", back_populates="drafts")
    order = relationship("Order", back_populates="drafts")

    __table_args__ = (
        Index("idx_draft_user_status", "user_id", "status"),
    )

from datetime import datetime, timezone
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    order_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    expected_delivery_date = Column(DateTime, nullable=True, index=True)
    status = Column(String(50), default="NEW", nullable=False, index=True) # NEW, IN_PROGRESS, READY, DELIVERED, CANCELLED
    pricing_mode = Column(String(30), default="GARMENT_WISE", nullable=False) # GARMENT_WISE, COMBINED
    total_amount = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="orders")
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")
    drafts = relationship("TransactionDraft", back_populates="order")

    __table_args__ = (
        Index("idx_order_user_status", "user_id", "status"),
        Index("idx_order_user_delivery", "user_id", "expected_delivery_date"),
    )

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False, index=True)
    garment_name = Column(String(100), nullable=False) # e.g. ಬ್ಲೌಸ್, ಚೂಡಿದಾರ್, ಲಂಗ
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    line_total = Column(Numeric(10, 2), default=Decimal("0.00"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="items")

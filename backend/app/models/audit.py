from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False, index=True) # customer, order, payment, expense
    entity_id = Column(Integer, nullable=False, index=True)
    action = Column(String(50), nullable=False) # CREATE, UPDATE, DELETE, CORRECTION, REVERSAL
    previous_data = Column(Text, nullable=True) # JSON
    new_data = Column(Text, nullable=True) # JSON
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audit_logs")

    __table_args__ = (
        Index("idx_audit_user_entity", "user_id", "entity_type", "entity_id"),
    )

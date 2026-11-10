from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.customer import Customer
from app.models.order import Order
from app.models.payment import Payment
from app.models.audit import AuditLog
from app.schemas.customer import CustomerCreate, CustomerUpdate
import json

class CustomerService:
    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int, user_id: int) -> Optional[Customer]:
        return db.query(Customer).filter(
            Customer.id == customer_id,
            Customer.user_id == user_id
        ).first()

    @staticmethod
    def calculate_customer_financials(db: Session, customer_id: int, user_id: int) -> Tuple[Decimal, Decimal, Decimal, int]:
        """Calculates total order value, total paid, and outstanding balance accurately."""
        # Total orders value (excluding cancelled orders)
        total_orders_val = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.customer_id == customer_id,
            Order.user_id == user_id,
            Order.status != "CANCELLED"
        ).scalar()
        total_orders = Decimal(str(total_orders_val))

        # Total payments made
        total_paid_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.customer_id == customer_id,
            Payment.user_id == user_id
        ).scalar()
        total_paid = Decimal(str(total_paid_val))

        # Orders count
        orders_count = db.query(func.count(Order.id)).filter(
            Order.customer_id == customer_id,
            Order.user_id == user_id
        ).scalar() or 0

        balance = total_orders - total_paid
        return total_orders, total_paid, balance, orders_count

    @staticmethod
    def search_customers(db: Session, user_id: int, query: str = "", skip: int = 0, limit: int = 50) -> List[Customer]:
        q = db.query(Customer).filter(Customer.user_id == user_id)
        if query:
            clean_q = query.strip()
            q = q.filter(
                or_(
                    Customer.name.ilike(f"%{clean_q}%"),
                    Customer.phone.ilike(f"%{clean_q}%")
                )
            )
        return q.order_by(Customer.created_at.desc()).offset(skip).limit(limit).all()

    @staticmethod
    def find_existing_by_name(db: Session, user_id: int, name: str) -> List[Customer]:
        """Check for existing customers with exact or similar names to prevent accidental duplicates."""
        name_clean = name.strip()
        return db.query(Customer).filter(
            Customer.user_id == user_id,
            Customer.name.ilike(f"%{name_clean}%")
        ).all()

    @staticmethod
    def create_customer(db: Session, user_id: int, customer_in: CustomerCreate) -> Customer:
        customer = Customer(
            user_id=user_id,
            name=customer_in.name.strip(),
            phone=customer_in.phone.strip() if customer_in.phone else None,
            notes=customer_in.notes
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

        # Audit log
        audit = AuditLog(
            user_id=user_id,
            entity_type="customer",
            entity_id=customer.id,
            action="CREATE",
            new_data=json.dumps({"name": customer.name, "phone": customer.phone})
        )
        db.add(audit)
        db.commit()

        return customer

    @staticmethod
    def update_customer(db: Session, customer: Customer, customer_in: CustomerUpdate) -> Customer:
        prev_data = {"name": customer.name, "phone": customer.phone, "notes": customer.notes}
        
        if customer_in.name is not None:
            customer.name = customer_in.name.strip()
        if customer_in.phone is not None:
            customer.phone = customer_in.phone.strip() if customer_in.phone else None
        if customer_in.notes is not None:
            customer.notes = customer_in.notes

        db.commit()
        db.refresh(customer)

        # Audit log
        audit = AuditLog(
            user_id=customer.user_id,
            entity_type="customer",
            entity_id=customer.id,
            action="UPDATE",
            previous_data=json.dumps(prev_data),
            new_data=json.dumps({"name": customer.name, "phone": customer.phone, "notes": customer.notes})
        )
        db.add(audit)
        db.commit()

        return customer

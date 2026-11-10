from decimal import Decimal
from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_
from app.models.order import Order, OrderItem
from app.models.customer import Customer
from app.models.payment import Payment
from app.models.audit import AuditLog
from app.schemas.order import OrderCreate, OrderUpdate
import json

class OrderService:
    @staticmethod
    def get_order_by_id(db: Session, order_id: int, user_id: int) -> Optional[Order]:
        return db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

    @staticmethod
    def calculate_order_financials(db: Session, order_id: int) -> Tuple[Decimal, Decimal]:
        """Returns (paid_amount, remaining_balance)."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            return Decimal("0.00"), Decimal("0.00")

        paid_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.order_id == order_id
        ).scalar()
        paid = Decimal(str(paid_val))
        remaining = order.total_amount - paid
        return paid, remaining

    @staticmethod
    def create_order(db: Session, user_id: int, order_in: OrderCreate) -> Order:
        # Validate customer belongs to user
        customer = db.query(Customer).filter(
            Customer.id == order_in.customer_id,
            Customer.user_id == user_id
        ).first()
        if not customer:
            raise ValueError("ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ (Customer not found)")

        # Compute total amount based on pricing mode
        total_amount = Decimal("0.00")
        if order_in.pricing_mode == "COMBINED":
            if order_in.total_amount is None or order_in.total_amount < 0:
                raise ValueError("ಒಟ್ಟು ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ (Please specify total order amount)")
            total_amount = order_in.total_amount
        else: # GARMENT_WISE
            if order_in.items:
                calc_total = Decimal("0.00")
                for item in order_in.items:
                    line_tot = Decimal(str(item.quantity)) * Decimal(str(item.unit_price))
                    calc_total += line_tot
                total_amount = calc_total
            elif order_in.total_amount:
                total_amount = order_in.total_amount

        order = Order(
            user_id=user_id,
            customer_id=order_in.customer_id,
            order_date=datetime.now(timezone.utc),
            expected_delivery_date=order_in.expected_delivery_date,
            status="NEW",
            pricing_mode=order_in.pricing_mode,
            total_amount=total_amount,
            notes=order_in.notes
        )
        db.add(order)
        db.flush() # flush to get order.id

        # Add items if present
        if order_in.items:
            for item_in in order_in.items:
                line_tot = item_in.line_total
                if not line_tot or line_tot == 0:
                    line_tot = Decimal(str(item_in.quantity)) * Decimal(str(item_in.unit_price))
                order_item = OrderItem(
                    order_id=order.id,
                    garment_name=item_in.garment_name.strip(),
                    quantity=item_in.quantity,
                    unit_price=item_in.unit_price,
                    line_total=line_tot
                )
                db.add(order_item)

        # Handle Advance Payment if specified
        if order_in.advance_amount and order_in.advance_amount > 0:
            payment = Payment(
                user_id=user_id,
                customer_id=order_in.customer_id,
                order_id=order.id,
                amount=order_in.advance_amount,
                payment_method=order_in.payment_method or "CASH",
                payment_date=datetime.now(timezone.utc),
                payment_type="ADVANCE",
                notes="ಆರ್ಡರ್ ಮುಂಗಡ ಹಣ (Order Advance Payment)"
            )
            db.add(payment)

        # Record audit log
        audit = AuditLog(
            user_id=user_id,
            entity_type="order",
            entity_id=order.id,
            action="CREATE",
            new_data=json.dumps({
                "customer_id": order.customer_id,
                "total_amount": str(order.total_amount),
                "pricing_mode": order.pricing_mode,
                "items_count": len(order_in.items)
            })
        )
        db.add(audit)
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def update_order(db: Session, order: Order, order_in: OrderUpdate) -> Order:
        prev_data = {
            "status": order.status,
            "total_amount": str(order.total_amount),
            "expected_delivery_date": str(order.expected_delivery_date) if order.expected_delivery_date else None
        }

        if order_in.status is not None:
            order.status = order_in.status
        if order_in.expected_delivery_date is not None:
            order.expected_delivery_date = order_in.expected_delivery_date
        if order_in.total_amount is not None:
            order.total_amount = order_in.total_amount
        if order_in.notes is not None:
            order.notes = order_in.notes

        db.commit()
        db.refresh(order)

        audit = AuditLog(
            user_id=order.user_id,
            entity_type="order",
            entity_id=order.id,
            action="UPDATE",
            previous_data=json.dumps(prev_data),
            new_data=json.dumps({
                "status": order.status,
                "total_amount": str(order.total_amount),
                "expected_delivery_date": str(order.expected_delivery_date) if order.expected_delivery_date else None
            })
        )
        db.add(audit)
        db.commit()
        return order

    @staticmethod
    def list_orders(
        db: Session,
        user_id: int,
        status: Optional[str] = None,
        customer_id: Optional[int] = None,
        delivery_filter: Optional[str] = None, # today, tomorrow, overdue, upcoming
        skip: int = 0,
        limit: int = 50
    ) -> List[Order]:
        q = db.query(Order).filter(Order.user_id == user_id)
        if status:
            q = q.filter(Order.status == status)
        if customer_id:
            q = q.filter(Order.customer_id == customer_id)

        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)
        tomorrow_start = today_start + (today_end - today_start)
        tomorrow_end = today_end + (today_end - today_start)

        if delivery_filter == "today":
            q = q.filter(and_(
                Order.expected_delivery_date >= today_start,
                Order.expected_delivery_date <= today_end
            ))
        elif delivery_filter == "tomorrow":
            q = q.filter(and_(
                Order.expected_delivery_date >= tomorrow_start,
                Order.expected_delivery_date <= tomorrow_end
            ))
        elif delivery_filter == "overdue":
            q = q.filter(and_(
                Order.expected_delivery_date < today_start,
                Order.status.notin_(["DELIVERED", "CANCELLED"])
            ))
        elif delivery_filter == "upcoming":
            q = q.filter(and_(
                Order.expected_delivery_date > today_end,
                Order.status.notin_(["DELIVERED", "CANCELLED"])
            ))

        return q.order_by(Order.order_date.desc()).offset(skip).limit(limit).all()

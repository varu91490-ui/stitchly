from decimal import Decimal
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.payment import Payment
from app.models.order import Order
from app.models.customer import Customer
from app.models.audit import AuditLog
from app.schemas.payment import PaymentCreate, PaymentCorrection
import json

class PaymentService:
    @staticmethod
    def create_payment(db: Session, user_id: int, payment_in: PaymentCreate) -> Payment:
        # Validate customer
        customer = db.query(Customer).filter(
            Customer.id == payment_in.customer_id,
            Customer.user_id == user_id
        ).first()
        if not customer:
            raise ValueError("ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ (Customer not found)")

        # Validate order if provided
        if payment_in.order_id:
            order = db.query(Order).filter(
                Order.id == payment_in.order_id,
                Order.user_id == user_id
            ).first()
            if not order:
                raise ValueError("ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ (Order not found)")

        # Duplicate check: check if identical payment recorded within last 2 minutes
        recent_time = datetime.now(timezone.utc).timestamp() - 120
        recent_dup = db.query(Payment).filter(
            Payment.user_id == user_id,
            Payment.customer_id == payment_in.customer_id,
            Payment.order_id == payment_in.order_id,
            Payment.amount == payment_in.amount,
            Payment.created_at >= datetime.fromtimestamp(recent_time, timezone.utc)
        ).first()
        if recent_dup:
            raise ValueError("ಈ ಪಾವತಿಯನ್ನು ಈಗಾಗಲೇ ದಾಖಲಿಸಲಾಗಿದೆ (Duplicate payment detected within 2 minutes)")

        payment = Payment(
            user_id=user_id,
            customer_id=payment_in.customer_id,
            order_id=payment_in.order_id,
            amount=payment_in.amount,
            payment_method=payment_in.payment_method,
            payment_date=payment_in.payment_date or datetime.now(timezone.utc),
            payment_type=payment_in.payment_type,
            notes=payment_in.notes
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Audit log
        audit = AuditLog(
            user_id=user_id,
            entity_type="payment",
            entity_id=payment.id,
            action="CREATE",
            new_data=json.dumps({
                "customer_id": payment.customer_id,
                "order_id": payment.order_id,
                "amount": str(payment.amount),
                "payment_method": payment.payment_method,
                "payment_type": payment.payment_type
            })
        )
        db.add(audit)
        db.commit()

        return payment

    @staticmethod
    def correct_payment(db: Session, payment_id: int, user_id: int, correction: PaymentCorrection) -> Payment:
        """
        Correction mechanism: updates amount with audit logging and explanation reason.
        Never silently overwrites without record.
        """
        payment = db.query(Payment).filter(
            Payment.id == payment_id,
            Payment.user_id == user_id
        ).first()
        if not payment:
            raise ValueError("ಪಾವತಿ ದಾಖಲೆ ಕಂಡುಬಂದಿಲ್ಲ (Payment record not found)")

        old_amount = str(payment.amount)
        old_notes = payment.notes

        payment.amount = correction.corrected_amount
        payment.payment_type = "CORRECTION"
        payment.notes = f"{payment.notes or ''} [ತಿದ್ದುಪಡಿ ಕಾರಣ / Correction Reason: {correction.reason}]".strip()

        db.commit()
        db.refresh(payment)

        audit = AuditLog(
            user_id=user_id,
            entity_type="payment",
            entity_id=payment.id,
            action="CORRECTION",
            previous_data=json.dumps({"amount": old_amount, "notes": old_notes}),
            new_data=json.dumps({
                "amount": str(payment.amount),
                "reason": correction.reason,
                "notes": payment.notes
            })
        )
        db.add(audit)
        db.commit()

        return payment

    @staticmethod
    def list_payments(
        db: Session,
        user_id: int,
        customer_id: Optional[int] = None,
        order_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Payment]:
        q = db.query(Payment).filter(Payment.user_id == user_id)
        if customer_id:
            q = q.filter(Payment.customer_id == customer_id)
        if order_id:
            q = q.filter(Payment.order_id == order_id)
        return q.order_by(Payment.payment_date.desc()).offset(skip).limit(limit).all()

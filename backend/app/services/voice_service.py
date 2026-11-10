from decimal import Decimal
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.customer import Customer
from app.models.order import Order
from app.models.payment import Payment
from app.models.draft import TransactionDraft
from app.services.customer_service import CustomerService
from app.services.kannada_nlp import (
    normalize_text,
    extract_customer_name,
    extract_garments,
    extract_pricing_and_payments,
    extract_delivery_date,
    classify_voice_query
)
from app.schemas.voice import VoiceParseResponse, VoiceQueryResponse, MatchedCustomer, ExtractedGarment
import json

class VoiceService:
    @staticmethod
    def process_voice_transcript(
        db: Session,
        user_id: int,
        transcript: str,
        draft_id: Optional[int] = None
    ) -> VoiceParseResponse:
        cleaned_text = normalize_text(transcript)
        
        # Load existing draft if draft_id is provided
        draft_obj: Optional[TransactionDraft] = None
        current_data: Dict[str, Any] = {
            "customer_name": None,
            "customer_id": None,
            "garments": [],
            "total_amount": None,
            "advance_amount": None,
            "delivery_date": None
        }

        if draft_id:
            draft_obj = db.query(TransactionDraft).filter(
                TransactionDraft.id == draft_id,
                TransactionDraft.user_id == user_id,
                TransactionDraft.status == "DRAFT"
            ).first()
            if draft_obj and draft_obj.draft_data:
                try:
                    current_data = json.loads(draft_obj.draft_data)
                except Exception:
                    pass

        # 1. Extract customer name
        detected_name = extract_customer_name(cleaned_text)
        matched_customers_list: List[MatchedCustomer] = []
        is_ambiguous = False

        if detected_name:
            current_data["customer_name"] = detected_name
            # Search in DB for existing customers with matching name
            existing = CustomerService.find_existing_by_name(db, user_id, detected_name)
            if len(existing) == 1:
                current_data["customer_id"] = existing[0].id
                current_data["customer_name"] = existing[0].name
            elif len(existing) > 1:
                is_ambiguous = True
                for c in existing:
                    _, _, bal, _ = CustomerService.calculate_customer_financials(db, c.id, user_id)
                    matched_customers_list.append(MatchedCustomer(
                        id=c.id,
                        name=c.name,
                        phone=c.phone,
                        outstanding_balance=bal
                    ))
            else:
                # New customer to be added
                current_data["customer_id"] = None

        # 2. Extract garments
        extracted_garms = extract_garments(cleaned_text)
        if extracted_garms:
            existing_garms = current_data.get("garments", [])
            for eg in extracted_garms:
                # Merge or append
                found = next((g for g in existing_garms if g["garment_name"] == eg["garment_name"]), None)
                if found:
                    found["quantity"] += eg["quantity"]
                else:
                    existing_garms.append(eg)
            current_data["garments"] = existing_garms

        # 3. Extract pricing & payments
        extracted_total, extracted_advance = extract_pricing_and_payments(cleaned_text)
        if extracted_total is not None:
            current_data["total_amount"] = str(extracted_total)
        if extracted_advance is not None:
            current_data["advance_amount"] = str(extracted_advance)

        # 4. Extract delivery date
        extracted_date = extract_delivery_date(cleaned_text)
        if extracted_date is not None:
            current_data["delivery_date"] = extracted_date.strftime("%Y-%m-%d")

        # 5. Missing fields checklist
        missing = []
        if not current_data.get("customer_name") and not current_data.get("customer_id"):
            missing.append("ಗ್ರಾಹಕರ ಹೆಸರು (Customer Name)")
        if not current_data.get("garments"):
            missing.append("ಬಟ್ಟೆಗಳ ವಿವರ (Garment Details)")
        if not current_data.get("total_amount"):
            missing.append("ಒಟ್ಟು ಮೊತ್ತ (Total Amount)")
        if not current_data.get("delivery_date"):
            missing.append("ವಿತರಣಾ ದಿನಾಂಕ (Delivery Date)")

        # 6. Save or update draft in database
        if not draft_obj:
            draft_obj = TransactionDraft(
                user_id=user_id,
                customer_id=current_data.get("customer_id"),
                draft_data=json.dumps(current_data),
                status="DRAFT"
            )
            db.add(draft_obj)
            db.commit()
            db.refresh(draft_obj)
        else:
            draft_obj.customer_id = current_data.get("customer_id")
            draft_obj.draft_data = json.dumps(current_data)
            db.commit()
            db.refresh(draft_obj)

        # Build Kannada Summary
        parts = []
        if current_data.get("customer_name"):
            parts.append(f"ಗ್ರಾಹಕರು: {current_data['customer_name']}")
        if current_data.get("garments"):
            garms_str = ", ".join([f"{g['garment_name']} ({g['quantity']})" for g in current_data["garments"]])
            parts.append(f"ಬಟ್ಟೆಗಳು: {garms_str}")
        if current_data.get("total_amount"):
            parts.append(f"ಒಟ್ಟು ಮೊತ್ತ: ₹{current_data['total_amount']}")
        if current_data.get("advance_amount"):
            parts.append(f"ಅಡ್ವಾನ್ಸ್: ₹{current_data['advance_amount']}")
        if current_data.get("delivery_date"):
            parts.append(f"ವಿತರಣೆ: {current_data['delivery_date']}")

        kannada_summary = " | ".join(parts) if parts else "ಮಾಹಿತಿ ದಾಖಲಿಸಲು ಸಿದ್ಧವಾಗಿದೆ"

        # Garments list for response
        garment_models = [
            ExtractedGarment(
                garment_name=g["garment_name"],
                quantity=g["quantity"],
                unit_price=Decimal(g["unit_price"]) if g.get("unit_price") else None,
                line_total=Decimal(g["line_total"]) if g.get("line_total") else None
            )
            for g in current_data.get("garments", [])
        ]

        return VoiceParseResponse(
            original_transcript=transcript,
            intent="NEW_ORDER" if current_data.get("customer_name") else "GENERAL_RECORD",
            customer_name=current_data.get("customer_name"),
            customer_id=current_data.get("customer_id"),
            matched_customers=matched_customers_list,
            is_ambiguous_customer=is_ambiguous,
            garments=garment_models,
            total_amount=Decimal(current_data["total_amount"]) if current_data.get("total_amount") else None,
            advance_amount=Decimal(current_data["advance_amount"]) if current_data.get("advance_amount") else None,
            delivery_date=current_data.get("delivery_date"),
            missing_fields=missing,
            draft_id=draft_obj.id,
            kannada_summary=kannada_summary
        )

    @staticmethod
    def answer_voice_query(db: Session, user_id: int, query: str) -> VoiceQueryResponse:
        classified = classify_voice_query(query)
        intent = classified["intent"]
        cust_name = classified.get("customer_name")

        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)

        # 1. "ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?"
        if intent == "TODAY_INCOME":
            val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
                Payment.user_id == user_id,
                Payment.payment_date >= today_start,
                Payment.payment_date <= today_end
            ).scalar()
            today_amt = Decimal(str(val))
            kannada_resp = f"ಇವತ್ತು ಒಟ್ಟು ₹{today_amt:,.2f} ಹಣ ಬಂದಿದೆ."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"today_income": str(today_amt)}
            )

        # 2. "ಈ ತಿಂಗಳು ಎಷ್ಟು ಆದಾಯ ಬಂದಿದೆ?"
        elif intent == "MONTHLY_INCOME":
            month_start = datetime(now.year, now.month, 1, 0, 0, 0, tzinfo=timezone.utc)
            val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
                Payment.user_id == user_id,
                Payment.payment_date >= month_start,
                Payment.payment_date <= today_end
            ).scalar()
            month_amt = Decimal(str(val))
            kannada_resp = f"ಈ ತಿಂಗಳು ಒಟ್ಟು ₹{month_amt:,.2f} ಆದಾಯ ಬಂದಿದೆ."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"monthly_income": str(month_amt)}
            )

        # 3. "ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?" (Customer outstanding balance)
        elif intent == "CUSTOMER_BALANCE":
            if not cust_name:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response="ದಯವಿಟ್ಟು ಗ್ರಾಹಕರ ಹೆಸರನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ತಿಳಿಸಿ.",
                    data=None
                )
            custs = CustomerService.find_existing_by_name(db, user_id, cust_name)
            if not custs:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response=f"'{cust_name}' ಹೆಸರಿನ ಗ್ರಾಹಕರು ಖಾತೆಯಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ.",
                    data=None
                )
            if len(custs) > 1:
                names = ", ".join([f"{c.name} ({c.phone or 'ಫೋನ್ ಇಲ್ಲ'})" for c in custs])
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response=f"'{cust_name}' ಹೆಸರಿನಲ್ಲಿ ಒಂದಕ್ಕಿಂತ ಹೆಚ್ಚು ಗ್ರಾಹಕರಿದ್ದಾರೆ: {names}. ದಯವಿಟ್ಟು ಆಯ್ಕೆಮಾಡಿ.",
                    data={"matches": [c.id for c in custs]}
                )
            
            cust = custs[0]
            _, _, bal, _ = CustomerService.calculate_customer_financials(db, cust.id, user_id)
            if bal > 0:
                kannada_resp = f"{cust.name} ಅವರು ₹{bal:,.2f} ಬಾಕಿ ಹಣ ಕೊಡಬೇಕು."
            else:
                kannada_resp = f"{cust.name} ಅವರದ್ದು ಯಾವುದೇ ಬಾಕಿ ಹಣವಿಲ್ಲ. ಎಲ್ಲಾ ಹಣ ಪಾವತಿಯಾಗಿದೆ."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"customer_id": cust.id, "balance": str(bal)}
            )

        # 4. "ನಾಳೆ ಯಾರ ಬಟ್ಟೆ ಕೊಡಬೇಕು?" (Tomorrow's deliveries)
        elif intent == "TOMORROW_DELIVERIES":
            tomorrow_start = today_start + timedelta(days=1)
            tomorrow_end = today_end + timedelta(days=1)
            orders = db.query(Order).filter(
                Order.user_id == user_id,
                Order.expected_delivery_date >= tomorrow_start,
                Order.expected_delivery_date <= tomorrow_end,
                Order.status.notin_(["DELIVERED", "CANCELLED"])
            ).all()
            if not orders:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response="ನಾಳೆ ವಿತರಿಸಲು ಯಾವುದೇ ಆರ್ಡರ್ ನಿಗದಿಯಾಗಿಲ್ಲ.",
                    data={"count": 0}
                )
            names = list(set([o.customer.name for o in orders if o.customer]))
            kannada_resp = f"ನಾಳೆ {len(orders)} ಆರ್ಡರ್ ಕೊಡಬೇಕು. ಗ್ರಾಹಕರು: {', '.join(names)}."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"count": len(orders), "customers": names}
            )

        # 5. "ಯಾವ ಆರ್ಡರ್ಗಳು ಇನ್ನೂ ಬಾಕಿ ಇವೆ?" (Pending orders)
        elif intent == "PENDING_ORDERS":
            pending = db.query(Order).filter(
                Order.user_id == user_id,
                Order.status.in_(["NEW", "IN_PROGRESS", "READY"])
            ).all()
            if not pending:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response="ಯಾವುದೇ ಬಾಕಿ ಆರ್ಡರ್ಗಳು ಇಲ್ಲ, ಎಲ್ಲಾ ಪೂರ್ಣಗೊಂಡಿವೆ!",
                    data={"count": 0}
                )
            kannada_resp = f"ಪ್ರಸ್ತುತ ಒಟ್ಟು {len(pending)} ಆರ್ಡರ್ಗಳು ಬಾಕಿ ಇವೆ (ಹೊಲಿಗೆ ಅಥವಾ ಸಿದ್ಧ ಸ್ಥಿತಿ)."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"pending_count": len(pending)}
            )

        # 6. "ರಮ್ಯಾ ಯಾವಾಗ ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು?" (Customer order timeline)
        elif intent == "CUSTOMER_TIMELINE":
            if not cust_name:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response="ದಯವಿಟ್ಟು ಗ್ರಾಹಕರ ಹೆಸರನ್ನು ತಿಳಿಸಿ.",
                    data=None
                )
            custs = CustomerService.find_existing_by_name(db, user_id, cust_name)
            if not custs:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response=f"'{cust_name}' ಹೆಸರಿನ ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ.",
                    data=None
                )
            cust = custs[0]
            latest_order = db.query(Order).filter(
                Order.user_id == user_id,
                Order.customer_id == cust.id
            ).order_by(Order.order_date.desc()).first()
            if not latest_order:
                return VoiceQueryResponse(
                    query=query,
                    intent=intent,
                    kannada_response=f"{cust.name} ಅವರ ಯಾವುದೇ ಆರ್ಡರ್ ಇತಿಹಾಸವಿಲ್ಲ.",
                    data=None
                )
            od_str = latest_order.order_date.strftime("%d-%m-%Y")
            kannada_resp = f"{cust.name} ಅವರು ಕೊನೆಯದಾಗಿ {od_str} ರಂದು ಬಟ್ಟೆ ಕೊಟ್ಟಿದ್ದರು. ಮೊತ್ತ: ₹{latest_order.total_amount:,.2f}."
            return VoiceQueryResponse(
                query=query,
                intent=intent,
                kannada_response=kannada_resp,
                data={"order_id": latest_order.id, "order_date": od_str}
            )

        return VoiceQueryResponse(
            query=query,
            intent="UNKNOWN",
            kannada_response="ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆ ಅರ್ಥವಾಗಲಿಲ್ಲ. ಉದಾಹರಣೆಗೆ 'ಇವತ್ತು ಎಷ್ಟು ಹಣ ಬಂತು?' ಅಥವಾ 'ಲಕ್ಷ್ಮಿ ಎಷ್ಟು ಹಣ ಕೊಡಬೇಕು?' ಎಂದು ಕೇಳಿ.",
            data=None
        )

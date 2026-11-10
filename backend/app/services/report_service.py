from decimal import Decimal
from typing import Dict, Any, List
from datetime import datetime, timezone, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.order import Order
from app.models.payment import Payment
from app.models.expense import Expense
from app.models.customer import Customer
from app.schemas.report import DashboardSummaryResponse, DailyReportResponse, MonthlyReportResponse

class ReportService:
    @staticmethod
    def get_dashboard_summary(db: Session, user_id: int) -> DashboardSummaryResponse:
        now = datetime.now(timezone.utc)
        today_start = datetime(now.year, now.month, now.day, 0, 0, 0, tzinfo=timezone.utc)
        today_end = datetime(now.year, now.month, now.day, 23, 59, 59, tzinfo=timezone.utc)
        
        month_start = datetime(now.year, now.month, 1, 0, 0, 0, tzinfo=timezone.utc)

        # 1. Today's actual payments collected
        today_paid_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.user_id == user_id,
            Payment.payment_date >= today_start,
            Payment.payment_date <= today_end
        ).scalar()
        today_received = Decimal(str(today_paid_val))

        # 2. Total outstanding balance across all orders
        all_orders_val = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.user_id == user_id,
            Order.status != "CANCELLED"
        ).scalar()
        all_payments_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.user_id == user_id
        ).scalar()
        total_outstanding = Decimal(str(all_orders_val)) - Decimal(str(all_payments_val))
        if total_outstanding < 0:
            total_outstanding = Decimal("0.00")

        # 3. New orders today
        new_orders_today = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.order_date >= today_start,
            Order.order_date <= today_end
        ).scalar() or 0

        # 4. Status counts
        orders_in_progress = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.status == "IN_PROGRESS"
        ).scalar() or 0

        orders_ready = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.status == "READY"
        ).scalar() or 0

        orders_delivered_today = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.status == "DELIVERED",
            Order.updated_at >= today_start,
            Order.updated_at <= today_end
        ).scalar() or 0

        # 5. Today's expenses
        today_exp_val = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= today_start,
            Expense.expense_date <= today_end
        ).scalar()
        today_expenses = Decimal(str(today_exp_val))
        today_net_cash = today_received - today_expenses

        # 6. Monthly collections & expenses
        month_paid_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.user_id == user_id,
            Payment.payment_date >= month_start,
            Payment.payment_date <= today_end
        ).scalar()
        month_received = Decimal(str(month_paid_val))

        month_exp_val = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= month_start,
            Expense.expense_date <= today_end
        ).scalar()
        month_expenses = Decimal(str(month_exp_val))

        return DashboardSummaryResponse(
            today_received=today_received,
            total_outstanding=total_outstanding,
            new_orders_today=new_orders_today,
            orders_in_progress=orders_in_progress,
            orders_ready=orders_ready,
            orders_delivered_today=orders_delivered_today,
            today_expenses=today_expenses,
            today_net_cash=today_net_cash,
            month_received=month_received,
            month_expenses=month_expenses
        )

    @staticmethod
    def get_daily_report(db: Session, user_id: int, target_date: date) -> DailyReportResponse:
        start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
        end_dt = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, tzinfo=timezone.utc)

        # Orders created on this day
        orders_q = db.query(
            func.count(Order.id).label("cnt"),
            func.coalesce(func.sum(Order.total_amount), 0).label("tot")
        ).filter(
            Order.user_id == user_id,
            Order.order_date >= start_dt,
            Order.order_date <= end_dt,
            Order.status != "CANCELLED"
        ).first()

        orders_count = orders_q.cnt or 0
        orders_val = Decimal(str(orders_q.tot))

        # Payments collected on this day
        payments_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.user_id == user_id,
            Payment.payment_date >= start_dt,
            Payment.payment_date <= end_dt
        ).scalar()
        payments_collected = Decimal(str(payments_val))

        # Expenses on this day
        exp_val = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_dt,
            Expense.expense_date <= end_dt
        ).scalar()
        expenses_total = Decimal(str(exp_val))

        # Delivered on this day
        delivered_count = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.status == "DELIVERED",
            Order.updated_at >= start_dt,
            Order.updated_at <= end_dt
        ).scalar() or 0

        net_cash = payments_collected - expenses_total
        balance_created = orders_val - payments_collected

        return DailyReportResponse(
            report_date=target_date,
            total_orders_created=orders_count,
            total_order_value=orders_val,
            total_payments_collected=payments_collected,
            total_expenses=expenses_total,
            outstanding_balance_created=balance_created if balance_created > 0 else Decimal("0.00"),
            orders_delivered_count=delivered_count,
            net_cash_movement=net_cash
        )

    @staticmethod
    def get_monthly_report(db: Session, user_id: int, year: int, month: int) -> MonthlyReportResponse:
        import calendar
        _, last_day = calendar.monthrange(year, month)
        start_dt = datetime(year, month, 1, 0, 0, 0, tzinfo=timezone.utc)
        end_dt = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)

        # Monthly order value
        order_val = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.user_id == user_id,
            Order.order_date >= start_dt,
            Order.order_date <= end_dt,
            Order.status != "CANCELLED"
        ).scalar()
        total_order_val = Decimal(str(order_val))

        # Monthly payments collected
        pay_val = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
            Payment.user_id == user_id,
            Payment.payment_date >= start_dt,
            Payment.payment_date <= end_dt
        ).scalar()
        total_payments = Decimal(str(pay_val))

        # Monthly expenses
        exp_val = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.user_id == user_id,
            Expense.expense_date >= start_dt,
            Expense.expense_date <= end_dt
        ).scalar()
        total_expenses = Decimal(str(exp_val))

        net_cash = total_payments - total_expenses
        outstanding = total_order_val - total_payments
        if outstanding < 0:
            outstanding = Decimal("0.00")

        # Distinct customers served
        customers_served = db.query(func.count(func.distinct(Order.customer_id))).filter(
            Order.user_id == user_id,
            Order.order_date >= start_dt,
            Order.order_date <= end_dt
        ).scalar() or 0

        # Completed orders
        completed_count = db.query(func.count(Order.id)).filter(
            Order.user_id == user_id,
            Order.status == "DELIVERED",
            Order.updated_at >= start_dt,
            Order.updated_at <= end_dt
        ).scalar() or 0

        return MonthlyReportResponse(
            year=year,
            month=month,
            total_order_value=total_order_val,
            total_payments_collected=total_payments,
            total_outstanding_balance=outstanding,
            total_expenses=total_expenses,
            net_cash_movement=net_cash,
            total_customers_served=customers_served,
            completed_orders_count=completed_count,
            daily_breakdown=[]
        )

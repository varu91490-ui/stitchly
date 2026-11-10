from typing import Optional, List, Dict, Any
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel

class DashboardSummaryResponse(BaseModel):
    today_received: Decimal = Decimal("0.00") # Actual payments collected today
    total_outstanding: Decimal = Decimal("0.00") # Total money owed by all customers
    new_orders_today: int = 0
    orders_in_progress: int = 0
    orders_ready: int = 0
    orders_delivered_today: int = 0
    today_expenses: Decimal = Decimal("0.00")
    today_net_cash: Decimal = Decimal("0.00")
    month_received: Decimal = Decimal("0.00")
    month_expenses: Decimal = Decimal("0.00")

class DailyReportResponse(BaseModel):
    report_date: date
    total_orders_created: int = 0
    total_order_value: Decimal = Decimal("0.00")
    total_payments_collected: Decimal = Decimal("0.00")
    total_expenses: Decimal = Decimal("0.00")
    outstanding_balance_created: Decimal = Decimal("0.00")
    orders_delivered_count: int = 0
    net_cash_movement: Decimal = Decimal("0.00")

class MonthlyReportResponse(BaseModel):
    year: int
    month: int
    total_order_value: Decimal = Decimal("0.00")
    total_payments_collected: Decimal = Decimal("0.00")
    total_outstanding_balance: Decimal = Decimal("0.00")
    total_expenses: Decimal = Decimal("0.00")
    net_cash_movement: Decimal = Decimal("0.00")
    total_customers_served: int = 0
    completed_orders_count: int = 0
    daily_breakdown: List[Dict[str, Any]] = []

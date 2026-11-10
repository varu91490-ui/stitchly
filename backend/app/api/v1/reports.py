from typing import Optional
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.report import DashboardSummaryResponse, DailyReportResponse, MonthlyReportResponse
from app.services.report_service import ReportService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/dashboard", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return ReportService.get_dashboard_summary(db, current_user.id)

@router.get("/daily", response_model=DailyReportResponse)
def get_daily_report(
    report_date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if report_date:
        t_date = datetime.strptime(report_date, "%Y-%m-%d").date()
    else:
        t_date = datetime.now(timezone.utc).date()
    return ReportService.get_daily_report(db, current_user.id, t_date)

@router.get("/monthly", response_model=MonthlyReportResponse)
def get_monthly_report(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now(timezone.utc)
    target_year = year or now.year
    target_month = month or now.month
    return ReportService.get_monthly_report(db, current_user.id, target_year, target_month)

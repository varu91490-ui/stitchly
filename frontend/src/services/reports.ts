import { request } from './api';
import { DashboardSummary, DailyReport, MonthlyReport } from '../types';

export const reportService = {
  async getDashboard(): Promise<DashboardSummary> {
    return request<DashboardSummary>('/reports/dashboard');
  },

  async getDaily(dateStr?: string): Promise<DailyReport> {
    const params = new URLSearchParams();
    if (dateStr) params.append('report_date', dateStr);
    return request<DailyReport>(`/reports/daily?${params.toString()}`);
  },

  async getMonthly(year?: number, month?: number): Promise<MonthlyReport> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    return request<MonthlyReport>(`/reports/monthly?${params.toString()}`);
  }
};

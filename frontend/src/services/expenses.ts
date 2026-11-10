import { request } from './api';
import { Expense } from '../types';

export const expenseService = {
  async list(category?: string): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    return request<Expense[]>(`/expenses/?${params.toString()}`);
  },

  async create(category: string, amount: number, description?: string, notes?: string): Promise<Expense> {
    return request<Expense>('/expenses/', {
      method: 'POST',
      body: JSON.stringify({ category, amount, description, notes }),
    });
  },

  async getSummary(year?: number, month?: number): Promise<{ total_expense: number; category_breakdown: any[] }> {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    return request<{ total_expense: number; category_breakdown: any[] }>(`/expenses/summary?${params.toString()}`);
  }
};

import { request } from './api';
import { Payment } from '../types';

export interface CreatePaymentPayload {
  customer_id: number;
  order_id?: number | null;
  amount: number;
  payment_method?: 'CASH' | 'UPI' | 'OTHER';
  payment_type?: 'ADVANCE' | 'PARTIAL' | 'FULL' | 'CORRECTION' | 'REFUND';
  notes?: string;
}

export const paymentService = {
  async list(filters: { customer_id?: number; order_id?: number } = {}): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.order_id) params.append('order_id', filters.order_id.toString());
    return request<Payment[]>(`/payments/?${params.toString()}`);
  },

  async create(payload: CreatePaymentPayload): Promise<Payment> {
    return request<Payment>('/payments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async correct(paymentId: number, corrected_amount: number, reason: string): Promise<Payment> {
    return request<Payment>(`/payments/${paymentId}/correct`, {
      method: 'POST',
      body: JSON.stringify({ corrected_amount, reason }),
    });
  }
};

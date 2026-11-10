import { request } from './api';
import { Order, OrderItem } from '../types';

export interface CreateOrderPayload {
  customer_id: number;
  pricing_mode: 'GARMENT_WISE' | 'COMBINED';
  total_amount?: number;
  items?: OrderItem[];
  expected_delivery_date?: string | null;
  advance_amount?: number;
  payment_method?: string;
  notes?: string;
}

export const orderService = {
  async list(filters: { status?: string; customer_id?: number; delivery_filter?: string } = {}): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    if (filters.delivery_filter) params.append('delivery_filter', filters.delivery_filter);
    return request<Order[]>(`/orders/?${params.toString()}`);
  },

  async get(id: number): Promise<Order> {
    return request<Order>(`/orders/${id}`);
  },

  async create(payload: CreateOrderPayload): Promise<Order> {
    return request<Order>('/orders/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async update(id: number, data: { status?: string; expected_delivery_date?: string; total_amount?: number; notes?: string }): Promise<Order> {
    return request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
};

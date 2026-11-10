import { request } from './api';
import { Customer } from '../types';

export const customerService = {
  async list(query: string = '', skip: number = 0, limit: number = 50): Promise<Customer[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    return request<Customer[]>(`/customers/?${params.toString()}`);
  },

  async get(id: number): Promise<Customer> {
    return request<Customer>(`/customers/${id}`);
  },

  async create(name: string, phone?: string, notes?: string): Promise<Customer> {
    return request<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify({ name, phone: phone || null, notes: notes || null }),
    });
  },

  async update(id: number, name?: string, phone?: string, notes?: string): Promise<Customer> {
    return request<Customer>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, phone: phone || null, notes: notes || null }),
    });
  }
};

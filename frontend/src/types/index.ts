export interface User {
  id: number;
  name: string;
  username: string;
  created_at: string;
}

export interface Customer {
  id: number;
  user_id: number;
  name: string;
  phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  total_order_value: number;
  total_paid: number;
  outstanding_balance: number;
  orders_count: number;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  garment_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: number;
  user_id: number;
  customer_id: number;
  customer_name?: string;
  order_date: string;
  expected_delivery_date?: string | null;
  status: 'NEW' | 'IN_PROGRESS' | 'READY' | 'DELIVERED' | 'CANCELLED';
  pricing_mode: 'GARMENT_WISE' | 'COMBINED';
  total_amount: number;
  paid_amount: number;
  remaining_balance: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface Payment {
  id: number;
  user_id: number;
  customer_id: number;
  customer_name?: string;
  order_id?: number | null;
  amount: number;
  payment_method: 'CASH' | 'UPI' | 'OTHER';
  payment_date: string;
  payment_type: 'ADVANCE' | 'PARTIAL' | 'FULL' | 'CORRECTION' | 'REFUND';
  notes?: string | null;
  created_at: string;
}

export interface Expense {
  id: number;
  user_id: number;
  category: string;
  description?: string | null;
  amount: number;
  expense_date: string;
  notes?: string | null;
  created_at: string;
}

export interface DashboardSummary {
  today_received: number;
  total_outstanding: number;
  new_orders_today: number;
  orders_in_progress: number;
  orders_ready: number;
  orders_delivered_today: number;
  today_expenses: number;
  today_net_cash: number;
  month_received: number;
  month_expenses: number;
}

export interface DailyReport {
  report_date: string;
  total_orders_created: number;
  total_order_value: number;
  total_payments_collected: number;
  total_expenses: number;
  outstanding_balance_created: number;
  orders_delivered_count: number;
  net_cash_movement: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  total_order_value: number;
  total_payments_collected: number;
  total_outstanding_balance: number;
  total_expenses: number;
  net_cash_movement: number;
  total_customers_served: number;
  completed_orders_count: number;
}

export interface MatchedCustomer {
  id: number;
  name: string;
  phone?: string | null;
  outstanding_balance: number;
}

export interface ExtractedGarment {
  garment_name: string;
  quantity: number;
  unit_price?: number | null;
  line_total?: number | null;
}

export interface VoiceParseResponse {
  original_transcript: string;
  intent: string;
  customer_name?: string | null;
  customer_id?: number | null;
  matched_customers: MatchedCustomer[];
  is_ambiguous_customer: boolean;
  garments: ExtractedGarment[];
  total_amount?: number | null;
  advance_amount?: number | null;
  delivery_date?: string | null;
  missing_fields: string[];
  draft_id?: number | null;
  kannada_summary: string;
}

export interface VoiceQueryResponse {
  query: string;
  intent: string;
  kannada_response: string;
  data?: any;
}

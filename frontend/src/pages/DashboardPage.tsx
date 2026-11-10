import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reports';
import { orderService } from '../services/orders';
import { paymentService } from '../services/payments';
import { DashboardSummary, Order, Payment } from '../types';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '../constants/kannada';
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  ArrowRight,
  TrendingUp,
  Receipt,
  UserPlus,
  Mic,
  Calendar
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [sumData, orders, payments] = await Promise.all([
        reportService.getDashboard(),
        orderService.list({}),
        paymentService.list({}),
      ]);
      setSummary(sumData);
      setRecentOrders(orders.slice(0, 4));
      setRecentPayments(payments.slice(0, 4));
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener('order_updated', handleUpdate);
    return () => window.removeEventListener('order_updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black">ನಮಸ್ಕಾರ! ಇಂದಿನ ವ್ಯವಹಾರ ಸಾರಾಂಶ</h2>
          <p className="text-sm text-brand-100 font-medium mt-1">
            ನಿಖರವಾದ ಲೆಕ್ಕಪತ್ರ • ಧ್ವನಿ ಮೂಲಕ ಹೊಸ ದಾಖಲೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಸೇರಿಸಿ
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/orders/new"
            className="px-4 py-2.5 bg-white text-brand-700 hover:bg-brand-50 rounded-xl font-bold text-sm shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ಆರ್ಡರ್</span>
          </Link>
          <Link
            to="/customers"
            className="px-4 py-2.5 bg-brand-800/80 hover:bg-brand-800 text-white rounded-xl font-bold text-sm border border-brand-400 shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>ಗ್ರಾಹಕರು</span>
          </Link>
        </div>
      </div>

      {/* 4 Core Financial & Status Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Cash Received */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ಇಂದಿನ ಆದಾಯ (ವಸೂಲಿ)</span>
            <div className="p-2 bg-emerald-100 rounded-xl">
              <IndianRupee className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              ₹{summary?.today_received ? summary.today_received.toLocaleString('en-IN') : '0'}
            </span>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">ಇಂದು ನಗದಾಗಿ ಪಡೆದ ಹಣ</p>
          </div>
        </div>

        {/* Outstanding Customer Balance */}
        <div className="bg-white rounded-2xl p-4 border border-red-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ಒಟ್ಟು ಬಾಕಿ ಹಣ</span>
            <div className="p-2 bg-red-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-red-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-red-600">
              ₹{summary?.total_outstanding ? summary.total_outstanding.toLocaleString('en-IN') : '0'}
            </span>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">ಗ್ರಾಹಕರು ಕೊಡಬೇಕಾದ ಹಣ</p>
          </div>
        </div>

        {/* Orders in Progress */}
        <div className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ</span>
            <div className="p-2 bg-amber-100 rounded-xl">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {summary?.orders_in_progress ?? 0}
            </span>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">ಸಿದ್ಧಪಡಿಸಬೇಕಾದ ಬಟ್ಟೆಗಳು</p>
          </div>
        </div>

        {/* Orders Ready for Delivery */}
        <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">ವಿತರಣೆಗೆ ಸಿದ್ಧ</span>
            <div className="p-2 bg-purple-100 rounded-xl">
              <Package className="w-5 h-5 text-purple-700" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-purple-700">
              {summary?.orders_ready ?? 0}
            </span>
            <p className="text-[11px] font-semibold text-gray-400 mt-1">ಗ್ರಾಹಕರಿಗೆ ನೀಡಲು ಸಿದ್ಧ</p>
          </div>
        </div>

      </div>

      {/* Net Cash and Expenses Summary Banner */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-3 bg-gray-100 rounded-2xl text-gray-700">
            <Receipt className="w-6 h-6 text-brand-700" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500">ಇಂದಿನ ಖರ್ಚುಗಳು: </span>
            <span className="text-base font-extrabold text-gray-800">
              ₹{summary?.today_expenses ? summary.today_expenses.toLocaleString('en-IN') : '0'}
            </span>
            <p className="text-xs text-gray-500">
              ನಿವ್ವಳ ನಗದು ಹರಿವು (Net Cash):{' '}
              <span className={`font-bold ${(summary?.today_net_cash ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                ₹{summary?.today_net_cash ? summary.today_net_cash.toLocaleString('en-IN') : '0'}
              </span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto justify-end">
          <Link
            to="/expenses"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            ಖರ್ಚು ದಾಖಲಿಸಿ
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-bold border border-brand-200 transition-colors"
          >
            ಸಂಪೂರ್ಣ ವರದಿ
          </Link>
        </div>
      </div>

      {/* Recent Orders & Recent Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
              <Package className="w-5 h-5 text-brand-700" />
              <span>ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು</span>
            </h3>
            <Link to="/orders" className="text-xs font-bold text-brand-700 hover:underline flex items-center">
              <span>ಎಲ್ಲಾ ನೋಡಿ</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲ</p>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((order) => {
                const statusMeta = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.NEW;
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block p-3 rounded-xl bg-gray-50 hover:bg-brand-50/50 border border-gray-200 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-gray-900">{order.customer_name || 'ಗ್ರಾಹಕರು'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ') || 'ಬಟ್ಟೆಗಳು'}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.color} ${statusMeta.bg}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="font-semibold text-gray-600">
                        ಒಟ್ಟು: ₹{order.total_amount} | ಬಾಕಿ: <span className="text-red-600 font-bold">₹{order.remaining_balance}</span>
                      </span>
                      <span className="text-gray-400">
                        {order.expected_delivery_date ? `ವಿತರಣೆ: ${new Date(order.expected_delivery_date).toLocaleDateString('kn-IN')}` : ''}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Payments Received */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>ಇತ್ತೀಚಿನ ಪಾವತಿಗಳು</span>
            </h3>
            <Link to="/reports" className="text-xs font-bold text-brand-700 hover:underline flex items-center">
              <span>ಎಲ್ಲಾ ನೋಡಿ</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">ಯಾವುದೇ ಪಾವತಿ ದಾಖಲಾಗಿಲ್ಲ</p>
          ) : (
            <div className="space-y-2.5">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-200"
                >
                  <div>
                    <p className="font-bold text-sm text-gray-900">{p.customer_name || 'ಗ್ರಾಹಕರು'}</p>
                    <p className="text-[11px] text-gray-500">
                      {PAYMENT_METHOD_MAP[p.payment_method] || p.payment_method} • {new Date(p.payment_date).toLocaleDateString('kn-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-emerald-700">+₹{p.amount}</span>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{p.payment_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

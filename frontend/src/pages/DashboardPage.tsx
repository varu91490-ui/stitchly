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
  Sparkles,
  ChevronRight
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
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-indigo-900 to-purple-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-violet-800/40">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-20 -top-6 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-800/60 text-amber-300 text-xs font-bold mb-2 border border-violet-700/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ದೈನಂದಿನ ವ್ಯಾಪಾರ ಸಾರಾಂಶ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">ನನ್ನ ಟೈಲರಿಂಗ್ ಖಾತೆ</h2>
            <p className="text-sm text-violet-200 font-medium mt-1">
              ಕನ್ನಡ ಧ್ವನಿ ಮೂಲಕ ಸುಲಭ ನಿರ್ವಹಣೆ • ನಿಖರವಾದ ಲೆಕ್ಕಪತ್ರ
            </p>
          </div>

          <div className="flex space-x-2.5 w-full sm:w-auto">
            <Link
              to="/orders/new"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 rounded-2xl font-black text-sm shadow-glow-amber flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>ಹೊಸ ಆರ್ಡರ್</span>
            </Link>
            <Link
              to="/customers"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-sm border border-white/20 backdrop-blur-sm shadow flex items-center justify-center space-x-1.5 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>ಗ್ರಾಹಕರು</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core Financial & Operational Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Today's Cash Received */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-3xl p-4 sm:p-5 border border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800">ಇಂದಿನ ಆದಾಯ (ವಸೂಲಿ)</span>
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-glow-emerald">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800">
              ₹{summary?.today_received ? summary.today_received.toLocaleString('en-IN') : '0'}
            </span>
            <p className="text-[11px] font-bold text-emerald-600/80 mt-1">ಇಂದು ನಗದಾಗಿ ಪಡೆದ ಹಣ</p>
          </div>
        </div>

        {/* Outstanding Customer Balance */}
        <div className="bg-gradient-to-br from-rose-50 via-orange-50/30 to-white rounded-3xl p-4 sm:p-5 border border-rose-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-800">ಒಟ್ಟು ಬಾಕಿ ಹಣ</span>
            <div className="p-2.5 bg-rose-500 text-white rounded-2xl shadow-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-rose-600">
              ₹{summary?.total_outstanding ? summary.total_outstanding.toLocaleString('en-IN') : '0'}
            </span>
            <p className="text-[11px] font-bold text-rose-500/80 mt-1">ಗ್ರಾಹಕರು ನೀಡಬೇಕಾದ ಬಾಕಿ</p>
          </div>
        </div>

        {/* Orders in Progress */}
        <div className="bg-gradient-to-br from-violet-50 via-indigo-50/30 to-white rounded-3xl p-4 sm:p-5 border border-violet-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-violet-600 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-violet-800">ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ</span>
            <div className="p-2.5 bg-violet-600 text-white rounded-2xl shadow-glow-violet">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-violet-900">
              {summary?.orders_in_progress ?? 0}
            </span>
            <p className="text-[11px] font-bold text-violet-600/80 mt-1">ಸಿದ್ಧಪಡಿಸಬೇಕಾದ ಬಟ್ಟೆಗಳು</p>
          </div>
        </div>

        {/* Orders Ready for Delivery */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50/30 to-white rounded-3xl p-4 sm:p-5 border border-amber-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">ವಿತರಣೆಗೆ ಸಿದ್ಧ</span>
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-glow-amber">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-amber-900">
              {summary?.orders_ready ?? 0}
            </span>
            <p className="text-[11px] font-bold text-amber-700/80 mt-1">ಗ್ರಾಹಕರಿಗೆ ನೀಡಲು ರೆಡಿ</p>
          </div>
        </div>

      </div>

      {/* Net Cash Movement & Quick Actions Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-glow-violet flex-shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500">ಇಂದಿನ ಖರ್ಚು:</span>
              <span className="text-sm font-black text-slate-800">
                ₹{summary?.today_expenses ? summary.today_expenses.toLocaleString('en-IN') : '0'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              ನಿವ್ವಳ ನಗದು ಹರಿವು (Net Cash):{' '}
              <span className={`font-black text-sm ${(summary?.today_net_cash ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ₹{summary?.today_net_cash ? summary.today_net_cash.toLocaleString('en-IN') : '0'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex space-x-2 w-full sm:w-auto justify-end">
          <Link
            to="/expenses"
            className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold transition-colors text-center"
          >
            ಖರ್ಚು ದಾಖಲಿಸಿ
          </Link>
          <Link
            to="/reports"
            className="flex-1 sm:flex-none px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-800 rounded-xl text-xs font-extrabold border border-violet-200 transition-colors text-center"
          >
            ಸಂಪೂರ್ಣ ವರದಿ
          </Link>
        </div>
      </div>

      {/* Recent Orders & Recent Payments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
              <Package className="w-5 h-5 text-violet-600" />
              <span>ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು</span>
            </h3>
            <Link to="/orders" className="text-xs font-bold text-violet-600 hover:underline flex items-center">
              <span>ಎಲ್ಲಾ ನೋಡಿ</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center font-medium">ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲ</p>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((order) => {
                const statusMeta = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.NEW;
                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="block p-3.5 rounded-2xl bg-slate-50/80 hover:bg-violet-50/40 border border-slate-200/60 hover:border-violet-200 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-sm text-slate-900">{order.customer_name || 'ಗ್ರಾಹಕರು'}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {order.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ') || 'ಬಟ್ಟೆಗಳು'}
                        </p>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusMeta.color} ${statusMeta.bg}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-200/50 text-xs">
                      <span className="font-medium text-slate-600">
                        ಒಟ್ಟು: <strong className="text-slate-800">₹{order.total_amount}</strong> | ಬಾಕಿ: <span className="text-rose-600 font-black">₹{order.remaining_balance}</span>
                      </span>
                      <span className="text-slate-400 font-medium">
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
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-base text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>ಇತ್ತೀಚಿನ ಪಾವತಿಗಳು</span>
            </h3>
            <Link to="/reports" className="text-xs font-bold text-violet-600 hover:underline flex items-center">
              <span>ಎಲ್ಲಾ ನೋಡಿ</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center font-medium">ಯಾವುದೇ ಪಾವತಿ ದಾಖಲಾಗಿಲ್ಲ</p>
          ) : (
            <div className="space-y-2.5">
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60"
                >
                  <div>
                    <p className="font-extrabold text-sm text-slate-900">{p.customer_name || 'ಗ್ರಾಹಕರು'}</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {PAYMENT_METHOD_MAP[p.payment_method] || p.payment_method} • {new Date(p.payment_date).toLocaleDateString('kn-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-base text-emerald-600">+₹{p.amount}</span>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{p.payment_type}</p>
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

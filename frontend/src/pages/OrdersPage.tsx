import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orders';
import { Order } from '../types';
import { ORDER_STATUS_MAP } from '../constants/kannada';
import { ShoppingBag, Plus, Filter, Calendar, ChevronRight } from 'lucide-react';

const STATUS_FILTERS = [
  { key: '', label: 'ಎಲ್ಲಾ (All)' },
  { key: 'NEW', label: 'ಹೊಸದು' },
  { key: 'IN_PROGRESS', label: 'ಹೊಲಿಗೆ' },
  { key: 'READY', label: 'ಸಿದ್ಧ' },
  { key: 'DELIVERED', label: 'ವಿತರಿಸಲಾಗಿದೆ' },
];

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOrders = async (status: string) => {
    try {
      setLoading(true);
      const data = await orderService.list({ status: status || undefined });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus);

    const handleUpdate = () => fetchOrders(selectedStatus);
    window.addEventListener('order_updated', handleUpdate);
    return () => window.removeEventListener('order_updated', handleUpdate);
  }, [selectedStatus]);

  const handleQuickStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.update(orderId, { status: newStatus });
      fetchOrders(selectedStatus);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Page Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-brand-700" />
            <span>ಆರ್ಡರ್‌ಗಳ ಪಟ್ಟಿ</span>
          </h2>
          <p className="text-xs text-gray-500 font-medium">ಒಟ್ಟು {orders.length} ಆರ್ಡರ್‌ಗಳು</p>
        </div>

        <Link
          to="/orders/new"
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ಹೊಸ ಆರ್ಡರ್</span>
        </Link>
      </div>

      {/* Status Filter Pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setSelectedStatus(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedStatus === f.key
                ? 'bg-brand-700 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm space-y-3">
          <p className="text-gray-500 font-semibold">ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
          <Link
            to="/orders/new"
            className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-bold shadow"
          >
            ಹೊಸ ಆರ್ಡರ್ ರಚಿಸಿ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const statusMeta = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.NEW;
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-brand-300 shadow-sm transition-all flex flex-col space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/customers/${o.customer_id}`}
                      className="text-base font-extrabold text-gray-900 hover:text-brand-700 transition-colors"
                    >
                      {o.customer_name || 'ಗ್ರಾಹಕರು'}
                    </Link>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">
                      {o.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ') || 'ಬಟ್ಟೆಗಳು'}
                    </p>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={o.status}
                    onChange={(e) => handleQuickStatusChange(o.id, e.target.value)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${statusMeta.color} ${statusMeta.bg}`}
                  >
                    <option value="NEW">ಹೊಸ ಆರ್ಡರ್</option>
                    <option value="IN_PROGRESS">ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ</option>
                    <option value="READY">ಸಿದ್ಧವಾಗಿದೆ</option>
                    <option value="DELIVERED">ವಿತರಿಸಲಾಗಿದೆ</option>
                    <option value="CANCELLED">ರದ್ದುಪಡಿಸಲಾಗಿದೆ</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-gray-500">ಒಟ್ಟು: <strong className="text-gray-800">₹{o.total_amount}</strong></span>
                    <span className="mx-1.5">•</span>
                    <span className="text-emerald-700 font-semibold">ಪಾವತಿ: ₹{o.paid_amount}</span>
                    <span className="mx-1.5">•</span>
                    <span className="text-red-600 font-bold">ಬಾಕಿ: ₹{o.remaining_balance}</span>
                  </div>

                  <Link
                    to={`/orders/${o.id}`}
                    className="flex items-center text-brand-700 hover:underline font-bold"
                  >
                    <span>ವಿವರ</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>

                {o.expected_delivery_date && (
                  <div className="text-[11px] text-gray-500 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>ವಿತರಣಾ ದಿನಾಂಕ: {new Date(o.expected_delivery_date).toLocaleDateString('kn-IN')}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

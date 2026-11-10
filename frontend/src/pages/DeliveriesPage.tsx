import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orders';
import { Order } from '../types';
import { ORDER_STATUS_MAP } from '../constants/kannada';
import { Truck, Calendar, CheckCircle2, Clock, AlertTriangle, PackageCheck } from 'lucide-react';

const TABS = [
  { key: 'today', label: 'ಇಂದು (Today)', icon: Calendar },
  { key: 'tomorrow', label: 'ನಾಳೆ (Tomorrow)', icon: Clock },
  { key: 'overdue', label: 'ಮೀರಿದ ದಿನಾಂಕ', icon: AlertTriangle },
  { key: 'upcoming', label: 'ಮುಂಬರುವ ದಿನಗಳು', icon: Truck },
];

export const DeliveriesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('today');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDeliveries = async (tab: string) => {
    try {
      setLoading(true);
      const data = await orderService.list({ delivery_filter: tab });
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries(activeTab);
  }, [activeTab]);

  const handleMarkDelivered = async (orderId: number) => {
    try {
      await orderService.update(orderId, { status: 'DELIVERED' });
      fetchDeliveries(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkReady = async (orderId: number) => {
    try {
      await orderService.update(orderId, { status: 'READY' });
      fetchDeliveries(activeTab);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
          <Truck className="w-6 h-6 text-violet-700" />
          <span>ವಿತರಣಾ ನಿರ್ವಹಣೆ (Deliveries)</span>
        </h2>
        <p className="text-xs text-slate-500 font-semibold">ಗ್ರಾಹಕರಿಗೆ ನೀಡಬೇಕಾದ ಬಟ್ಟೆಗಳ ದಿನಾಂಕ ಮತ್ತು ಸ್ಥಿತಿ</p>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-black flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                isActive
                  ? 'bg-gradient-to-r from-violet-700 to-indigo-700 text-white border-violet-800 shadow-glow-violet'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-2">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <PackageCheck className="w-8 h-8" />
          </div>
          <p className="text-slate-800 font-black text-base">ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ!</p>
          <p className="text-xs text-slate-400 font-medium">ಎಲ್ಲಾ ಬಟ್ಟೆಗಳು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ವಿತರಿಸಲಾಗಿವೆ.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const statusMeta = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.NEW;
            return (
              <div
                key={o.id}
                className="bg-white rounded-3xl p-4.5 border border-slate-200/80 shadow-sm space-y-3 hover:border-violet-200 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/customers/${o.customer_id}`}
                      className="text-base font-black text-slate-900 hover:text-violet-700 transition-colors"
                    >
                      {o.customer_name}
                    </Link>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {o.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ')}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusMeta.color} ${statusMeta.bg}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                  <span>
                    ವಿತರಣಾ ದಿನಾಂಕ: <strong className="text-slate-900">{o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString('kn-IN') : 'ನಿಗದಿಯಾಗಿಲ್ಲ'}</strong>
                  </span>
                  <span className="font-black text-rose-600">
                    ಬಾಕಿ: ₹{o.remaining_balance}
                  </span>
                </div>

                {/* Quick Delivery Actions */}
                <div className="flex space-x-2 pt-1">
                  {o.status !== 'READY' && o.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleMarkReady(o.id)}
                      className="flex-1 py-2.5 bg-violet-100 hover:bg-violet-200 text-violet-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      ಸಿದ್ಧವಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ
                    </button>
                  )}
                  {o.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(o.id)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-glow-emerald transition-all flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ಗ್ರಾಹಕರಿಗೆ ನೀಡಲಾಗಿದೆ</span>
                    </button>
                  )}
                  <Link
                    to={`/orders/${o.id}`}
                    className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    ವಿವರ
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

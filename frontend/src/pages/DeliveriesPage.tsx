import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orders';
import { Order } from '../types';
import { ORDER_STATUS_MAP } from '../constants/kannada';
import { Truck, Calendar, CheckCircle2, Clock, AlertTriangle, PackageCheck } from 'lucide-react';

const TABS = [
  { key: 'today', label: 'ಇಂದು (Today)', icon: Calendar },
  { key: 'tomorrow', label: 'ನಾಳೆ (Tomorrow)', icon: Clock },
  { key: 'overdue', label: 'ಮೀರಿದ ದಿನಾಂಕ (Overdue)', icon: AlertTriangle },
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
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center space-x-2">
          <Truck className="w-6 h-6 text-brand-700" />
          <span>ವಿತರಣಾ ನಿರ್ವಹಣೆ (Deliveries)</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium">ಗ್ರಾಹಕರಿಗೆ ನೀಡಬೇಕಾದ ಬಟ್ಟೆಗಳ ದಿನಾಂಕ ಮತ್ತು ಸ್ಥಿತಿ</p>
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
              className={`py-3 px-3 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 transition-all shadow-sm ${
                isActive
                  ? 'bg-brand-700 text-white border-brand-800 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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
        <div className="py-12 text-center text-gray-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm space-y-2">
          <PackageCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <p className="text-gray-600 font-bold text-base">ಈ ವಿಭಾಗದಲ್ಲಿ ಯಾವುದೇ ಆರ್ಡರ್ ಇಲ್ಲ!</p>
          <p className="text-xs text-gray-400">ಎಲ್ಲಾ ಬಟ್ಟೆಗಳು ಸಮಯಕ್ಕೆ ಸರಿಯಾಗಿ ವಿತರಿಸಲಾಗಿವೆ.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const statusMeta = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.NEW;
            return (
              <div
                key={o.id}
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      to={`/customers/${o.customer_id}`}
                      className="text-base font-extrabold text-gray-900 hover:text-brand-700 transition-colors"
                    >
                      {o.customer_name}
                    </Link>
                    <p className="text-xs text-gray-600 font-semibold mt-0.5">
                      {o.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ')}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusMeta.color} ${statusMeta.bg}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl">
                  <span>
                    ವಿತರಣಾ ದಿನಾಂಕ: <strong className="text-gray-900">{o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString('kn-IN') : 'ನಿಗದಿಯಾಗಿಲ್ಲ'}</strong>
                  </span>
                  <span className="font-extrabold text-red-600">
                    ಬಾಕಿ: ₹{o.remaining_balance}
                  </span>
                </div>

                {/* Quick Delivery Actions */}
                <div className="flex space-x-2 pt-1">
                  {o.status !== 'READY' && o.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleMarkReady(o.id)}
                      className="flex-1 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl text-xs font-bold transition-colors"
                    >
                      ಸಿದ್ಧವಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ
                    </button>
                  )}
                  {o.status !== 'DELIVERED' && (
                    <button
                      type="button"
                      onClick={() => handleMarkDelivered(o.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ಗ್ರಾಹಕರಿಗೆ ನೀಡಲಾಗಿದೆ (Delivered)</span>
                    </button>
                  )}
                  <Link
                    to={`/orders/${o.id}`}
                    className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
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

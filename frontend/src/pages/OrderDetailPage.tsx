import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orders';
import { paymentService } from '../services/payments';
import { Order, Payment } from '../types';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '../constants/kannada';
import {
  ShoppingBag,
  ArrowLeft,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  User,
  Plus,
  X,
  Check,
  Edit2
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id || '0');
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pay Modal
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'OTHER'>('CASH');
  const [payNotes, setPayNotes] = useState<string>('');
  const [submittingPay, setSubmittingPay] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const [oData, pData] = await Promise.all([
        orderService.get(orderId),
        paymentService.list({ order_id: orderId }),
      ]);
      setOrder(oData);
      setPayments(pData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    try {
      const updated = await orderService.update(order.id, { status: newStatus });
      setOrder(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      setPayError('ಸರಿಯಾದ ಪಾವತಿ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ');
      return;
    }
    setSubmittingPay(true);
    setPayError(null);

    try {
      await paymentService.create({
        customer_id: order.customer_id,
        order_id: order.id,
        amount: amt,
        payment_method: payMethod,
        payment_type: amt >= order.remaining_balance ? 'FULL' : 'PARTIAL',
        notes: payNotes || undefined,
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      loadOrder();
    } catch (err: any) {
      setPayError(err.message || 'ಪಾವತಿ ದಾಖಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setSubmittingPay(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>;
  }

  if (!order) {
    return <div className="py-12 text-center text-red-500 font-bold">ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ</div>;
  }

  const statusMeta = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.NEW;

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">ಆರ್ಡರ್ #{order.id}</h2>
            <Link
              to={`/customers/${order.customer_id}`}
              className="text-xs text-brand-700 font-bold hover:underline"
            >
              ಗ್ರಾಹಕರು: {order.customer_name}
            </Link>
          </div>
        </div>

        {/* Status Dropdown */}
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer ${statusMeta.color} ${statusMeta.bg}`}
        >
          <option value="NEW">ಹೊಸ ಆರ್ಡರ್</option>
          <option value="IN_PROGRESS">ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ</option>
          <option value="READY">ಸಿದ್ಧವಾಗಿದೆ</option>
          <option value="DELIVERED">ವಿತರಿಸಲಾಗಿದೆ</option>
          <option value="CANCELLED">ರದ್ದುಪಡಿಸಲಾಗಿದೆ</option>
        </select>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಒಟ್ಟು ಮೊತ್ತ</span>
            <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">₹{order.total_amount}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಪಾವತಿಸಿದ ಹಣ</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{order.paid_amount}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಉಳಿದ ಬಾಕಿ</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${order.remaining_balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              ₹{order.remaining_balance}
            </p>
          </div>
        </div>

        {order.remaining_balance > 0 && (
          <button
            onClick={() => {
              setPayAmount(order.remaining_balance.toString());
              setShowPayModal(true);
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <IndianRupee className="w-4 h-4" />
            <span>ಬಾಕಿ ಹಣ ಪಾವತಿ ದಾಖಲಿಸಿ (₹{order.remaining_balance})</span>
          </button>
        )}
      </div>

      {/* Garments Items Details */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base text-gray-900 border-b pb-2">ಬಟ್ಟೆಗಳ ಪಟ್ಟಿ</h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="py-2.5 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-gray-800">{it.garment_name}</p>
                <p className="text-xs text-gray-500">ಸಂಖ್ಯೆ: {it.quantity}</p>
              </div>
              {order.pricing_mode === 'GARMENT_WISE' ? (
                <div className="text-right">
                  <span className="font-extrabold text-gray-900">₹{it.line_total}</span>
                  <p className="text-[11px] text-gray-400">@ ₹{it.unit_price} ಪ್ರತಿ ಪೀಸ್</p>
                </div>
              ) : (
                <span className="text-xs text-gray-400 font-semibold">ಒಟ್ಟಾರೆ ಬೆಲೆ</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dates and Notes */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-2 text-xs text-gray-600">
        <p>
          <strong className="text-gray-800">ಆರ್ಡರ್ ದಿನಾಂಕ:</strong> {new Date(order.order_date).toLocaleDateString('kn-IN')}
        </p>
        {order.expected_delivery_date && (
          <p>
            <strong className="text-gray-800">ವಿತರಣಾ ದಿನಾಂಕ:</strong> {new Date(order.expected_delivery_date).toLocaleDateString('kn-IN')}
          </p>
        )}
        {order.notes && (
          <p>
            <strong className="text-gray-800">ಟಿಪ್ಪಣಿ:</strong> {order.notes}
          </p>
        )}
      </div>

      {/* Payments Made Towards This Order */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
        <h3 className="font-extrabold text-base text-gray-900 border-b pb-2">ಪಾವತಿಗಳು</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-gray-400 py-2">ಯಾವುದೇ ಪಾವತಿ ದಾಖಲಾಗಿಲ್ಲ</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border text-xs">
                <div>
                  <span className="font-bold text-gray-800">{PAYMENT_METHOD_MAP[p.payment_method]}</span>
                  <p className="text-gray-500">{new Date(p.payment_date).toLocaleDateString('kn-IN')} • {p.notes || p.payment_type}</p>
                </div>
                <span className="font-black text-sm text-emerald-700">+₹{p.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-emerald-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">ಪಾವತಿ ದಾಖಲಿಸಿ</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {payError && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold border border-red-200">
                {payError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ಮೊತ್ತ (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-lg font-black text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ಪಾವತಿ ವಿಧಾನ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('CASH')}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      payMethod === 'CASH' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    ನಗದು (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('UPI')}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      payMethod === 'UPI' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    ಯುಪಿಐ (PhonePe / GPay)
                  </button>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>ದಾಖಲಿಸಿ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

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
    return <div className="py-12 text-center text-slate-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>;
  }

  if (!order) {
    return <div className="py-12 text-center text-rose-500 font-bold">ಆರ್ಡರ್ ಕಂಡುಬಂದಿಲ್ಲ</div>;
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
            className="p-2.5 bg-white rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 shadow-sm transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">ಆರ್ಡರ್ #{order.id}</h2>
            <Link
              to={`/customers/${order.customer_id}`}
              className="text-xs text-violet-700 font-bold hover:underline"
            >
              ಗ್ರಾಹಕರು: {order.customer_name}
            </Link>
          </div>
        </div>

        {/* Status Dropdown */}
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className={`text-xs font-black px-3.5 py-2 rounded-2xl border shadow-sm cursor-pointer ${statusMeta.color} ${statusMeta.bg}`}
        >
          <option value="NEW">ಹೊಸ ಆರ್ಡರ್</option>
          <option value="IN_PROGRESS">ಹೊಲಿಗೆ ನಡೆಯುತ್ತಿದೆ</option>
          <option value="READY">ಸಿದ್ಧವಾಗಿದೆ</option>
          <option value="DELIVERED">ವಿತರಿಸಲಾಗಿದೆ</option>
          <option value="CANCELLED">ರದ್ದುಪಡಿಸಲಾಗಿದೆ</option>
        </select>
      </div>

      {/* Financial Summary Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ಒಟ್ಟು ಮೊತ್ತ</span>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">₹{order.total_amount}</p>
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ಪಾವತಿಸಿದ ಹಣ</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹{order.paid_amount}</p>
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ಉಳಿದ ಬಾಕಿ</span>
            <p className={`text-xl sm:text-2xl font-black mt-1 ${order.remaining_balance > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
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
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-glow-emerald flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <IndianRupee className="w-4 h-4" />
            <span>ಬಾಕಿ ಹಣ ಪಾವತಿ ದಾಖಲಿಸಿ (₹{order.remaining_balance})</span>
          </button>
        )}
      </div>

      {/* Garments Items Details */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2.5">ಬಟ್ಟೆಗಳ ಪಟ್ಟಿ</h3>
        <div className="divide-y divide-slate-100">
          {order.items.map((it, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-slate-800">{it.garment_name}</p>
                <p className="text-xs text-slate-500 font-medium">ಸಂಖ್ಯೆ: {it.quantity}</p>
              </div>
              {order.pricing_mode === 'GARMENT_WISE' ? (
                <div className="text-right">
                  <span className="font-black text-slate-900">₹{it.line_total}</span>
                  <p className="text-[11px] text-slate-400 font-medium">@ ₹{it.unit_price} ಪ್ರತಿ ಪೀಸ್</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-semibold">ಒಟ್ಟಾರೆ ಬೆಲೆ</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dates and Notes */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-2.5 text-xs text-slate-600">
        <p>
          <strong className="text-slate-800 font-bold">ಆರ್ಡರ್ ದಿನಾಂಕ:</strong> {new Date(order.order_date).toLocaleDateString('kn-IN')}
        </p>
        {order.expected_delivery_date && (
          <p>
            <strong className="text-slate-800 font-bold">ವಿತರಣಾ ದಿನಾಂಕ:</strong> {new Date(order.expected_delivery_date).toLocaleDateString('kn-IN')}
          </p>
        )}
        {order.notes && (
          <p>
            <strong className="text-slate-800 font-bold">ಟಿಪ್ಪಣಿ:</strong> {order.notes}
          </p>
        )}
      </div>

      {/* Payments Made Towards This Order */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-black text-base text-slate-900 border-b border-slate-100 pb-2.5">ಪಾವತಿಗಳು</h3>
        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-2 font-medium">ಯಾವುದೇ ಪಾವತಿ ದಾಖಲಾಗಿಲ್ಲ</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50/80 rounded-2xl border border-slate-200/60 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{PAYMENT_METHOD_MAP[p.payment_method]}</span>
                  <p className="text-slate-500 font-medium mt-0.5">{new Date(p.payment_date).toLocaleDateString('kn-IN')} • {p.notes || p.payment_type}</p>
                </div>
                <span className="font-black text-sm text-emerald-700">+₹{p.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Pay Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-emerald-300 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">ಪಾವತಿ ದಾಖಲಿಸಿ</h3>
              <button onClick={() => setShowPayModal(false)} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payError && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
                {payError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಮೊತ್ತ (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xl font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">ಪಾವತಿ ವಿಧಾನ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('CASH')}
                    className={`py-2.5 text-xs font-bold rounded-2xl border transition-all ${
                      payMethod === 'CASH' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ನಗದು (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('UPI')}
                    className={`py-2.5 text-xs font-bold rounded-2xl border transition-all ${
                      payMethod === 'UPI' ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
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
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-colors"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm shadow-glow-emerald flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
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

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerService } from '../services/customers';
import { orderService } from '../services/orders';
import { paymentService } from '../services/payments';
import { Customer, Order, Payment } from '../types';
import { ORDER_STATUS_MAP, PAYMENT_METHOD_MAP } from '../constants/kannada';
import {
  User,
  Phone,
  IndianRupee,
  Plus,
  ShoppingBag,
  Receipt,
  ArrowLeft,
  X,
  Check,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customerId = parseInt(id || '0');

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick Payment Modal
  const [showPayModal, setShowPayModal] = useState<boolean>(false);
  const [payAmount, setPayAmount] = useState<string>('');
  const [payMethod, setPayMethod] = useState<'CASH' | 'UPI' | 'OTHER'>('CASH');
  const [payNotes, setPayNotes] = useState<string>('');
  const [submittingPay, setSubmittingPay] = useState<boolean>(false);
  const [payError, setPayError] = useState<string | null>(null);

  const loadData = async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      const [cData, oData, pData] = await Promise.all([
        customerService.get(customerId),
        orderService.list({ customer_id: customerId }),
        paymentService.list({ customer_id: customerId }),
      ]);
      setCustomer(cData);
      setOrders(oData);
      setPayments(pData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [customerId]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      setPayError('ಸರಿಯಾದ ಪಾವತಿ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ');
      return;
    }
    setSubmittingPay(true);
    setPayError(null);

    try {
      await paymentService.create({
        customer_id: customerId,
        amount: amt,
        payment_method: payMethod,
        payment_type: 'PARTIAL',
        notes: payNotes || undefined,
      });
      setShowPayModal(false);
      setPayAmount('');
      setPayNotes('');
      loadData();
    } catch (err: any) {
      setPayError(err.message || 'ಪಾವತಿ ದಾಖಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setSubmittingPay(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-gray-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>;
  }

  if (!customer) {
    return <div className="py-12 text-center text-red-500 font-bold">ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ</div>;
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Back Button and Title */}
      <div className="flex items-center space-x-3">
        <Link to="/customers" className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{customer.name}</h2>
          <p className="text-xs text-gray-500 font-medium">
            {customer.phone ? `ಫೋನ್: ${customer.phone}` : 'ಫೋನ್ ನಂಬರ್ ಇಲ್ಲ'}
          </p>
        </div>
      </div>

      {/* Financial Overview Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-gray-100">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಒಟ್ಟು ವ್ಯಾಪಾರ</span>
            <p className="text-lg sm:text-2xl font-black text-gray-900 mt-1">₹{customer.total_order_value}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಪಾವತಿಸಿದ ಹಣ</span>
            <p className="text-lg sm:text-2xl font-black text-emerald-600 mt-1">₹{customer.total_paid}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase">ಉಳಿದ ಬಾಕಿ</span>
            <p className={`text-lg sm:text-2xl font-black mt-1 ${customer.outstanding_balance > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              ₹{customer.outstanding_balance}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowPayModal(true)}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <IndianRupee className="w-4 h-4" />
            <span>ಪಾವತಿ ದಾಖಲಿಸಿ</span>
          </button>
          <Link
            to={`/orders/new?customer_id=${customer.id}`}
            className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ಆರ್ಡರ್</span>
          </Link>
        </div>
      </div>

      {/* Order History */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-gray-900 flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-brand-700" />
          <span>ಆರ್ಡರ್‌ಗಳ ಇತಿಹಾಸ ({orders.length})</span>
        </h3>

        {orders.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-center text-sm text-gray-400">
            ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳು ಇಲ್ಲ
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.map((o) => {
              const statusMeta = ORDER_STATUS_MAP[o.status] || ORDER_STATUS_MAP.NEW;
              return (
                <Link
                  key={o.id}
                  to={`/orders/${o.id}`}
                  className="block bg-white p-4 rounded-2xl border border-gray-200 hover:border-brand-300 shadow-sm transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-base text-gray-900">
                        {o.items.map((it) => `${it.garment_name} (${it.quantity})`).join(', ') || 'ಬಟ್ಟೆಗಳು'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ದಿನಾಂಕ: {new Date(o.order_date).toLocaleDateString('kn-IN')}
                        {o.expected_delivery_date ? ` • ವಿತರಣೆ: ${new Date(o.expected_delivery_date).toLocaleDateString('kn-IN')}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusMeta.color} ${statusMeta.bg}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-xs">
                    <span className="font-semibold text-gray-700">
                      ಒಟ್ಟು ಮೊತ್ತ: <span className="font-bold">₹{o.total_amount}</span> | ಪಾವತಿಸಿದ್ದು: <span className="text-emerald-700 font-bold">₹{o.paid_amount}</span>
                    </span>
                    <span className="font-extrabold text-sm text-red-600">
                      ಬಾಕಿ: ₹{o.remaining_balance}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-gray-900 flex items-center space-x-2">
          <Receipt className="w-5 h-5 text-emerald-600" />
          <span>ಪಾವತಿಗಳ ಇತಿಹಾಸ ({payments.length})</span>
        </h3>

        {payments.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-center text-sm text-gray-400">
            ಯಾವುದೇ ಪಾವತಿ ದಾಖಲಾಗಿಲ್ಲ
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    {PAYMENT_METHOD_MAP[p.payment_method] || p.payment_method}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(p.payment_date).toLocaleDateString('kn-IN')} • {p.notes || p.payment_type}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-emerald-700">+₹{p.amount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 border border-emerald-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <span>ಪಾವತಿ ದಾಖಲಿಸಿ ({customer.name})</span>
              </h3>
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
                <label className="block text-xs font-bold text-gray-700 mb-1">ಪಾವತಿಸಿದ ಮೊತ್ತ (₹)</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="ಉದಾ: 500"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-lg font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ಪಾವತಿ ವಿಧಾನ</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('CASH')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      payMethod === 'CASH'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    ನಗದು (Cash)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('UPI')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      payMethod === 'UPI'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow'
                        : 'bg-gray-50 text-gray-700 border-gray-300'
                    }`}
                  >
                    ಯುಪಿಐ (PhonePe / GPay)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ಟಿಪ್ಪಣಿಗಳು (ಐಚ್ಛಿಕ)</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="ಉದಾ: ಬಾಕಿ ಹಣ ನೀಡಿದ್ದಾರೆ"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={submittingPay}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow flex items-center justify-center space-x-1"
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

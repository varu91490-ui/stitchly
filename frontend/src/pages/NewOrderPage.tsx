import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../services/customers';
import { orderService } from '../services/orders';
import { Customer, OrderItem } from '../types';
import { GARMENT_OPTIONS } from '../constants/kannada';
import { ShoppingBag, ArrowLeft, Plus, Trash2, Check, IndianRupee, Calendar } from 'lucide-react';

export const NewOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preselectedCustId = searchParams.get('customer_id');
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>(
    preselectedCustId ? parseInt(preselectedCustId) : ''
  );

  // Pricing Mode
  const [pricingMode, setPricingMode] = useState<'GARMENT_WISE' | 'COMBINED'>('GARMENT_WISE');
  const [combinedTotal, setCombinedTotal] = useState<string>('');

  // Items
  const [items, setItems] = useState<OrderItem[]>([
    { garment_name: 'ಬ್ಲೌಸ್', quantity: 1, unit_price: 300, line_total: 300 },
  ]);

  // Advance & Delivery
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'OTHER'>('CASH');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customerService.list().then(setCustomers).catch(console.error);
  }, []);

  // Update item line total
  const handleItemChange = (index: number, field: keyof OrderItem, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    if (field === 'quantity' || field === 'unit_price') {
      const q = updated[index].quantity || 0;
      const u = updated[index].unit_price || 0;
      updated[index].line_total = q * u;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([...items, { garment_name: 'ಬ್ಲೌಸ್', quantity: 1, unit_price: 300, line_total: 300 }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const calculatedOrderTotal = (): number => {
    if (pricingMode === 'COMBINED') {
      return parseFloat(combinedTotal) || 0;
    }
    return items.reduce((acc, curr) => acc + (curr.line_total || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setError('ದಯವಿಟ್ಟು ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ');
      return;
    }
    if (items.length === 0) {
      setError('ಕನಿಷ್ಠ ಒಂದು ಬಟ್ಟೆಯ ವಿವರವನ್ನು ಸೇರಿಸಿ');
      return;
    }
    if (pricingMode === 'COMBINED' && (!combinedTotal || parseFloat(combinedTotal) <= 0)) {
      setError('ಒಟ್ಟು ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const totalAmt = calculatedOrderTotal();
      const advAmt = advanceAmount ? parseFloat(advanceAmount) : undefined;
      const delDate = deliveryDate ? new Date(deliveryDate).toISOString() : null;

      const created = await orderService.create({
        customer_id: Number(selectedCustomerId),
        pricing_mode: pricingMode,
        total_amount: totalAmt,
        items,
        expected_delivery_date: delDate,
        advance_amount: advAmt,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });

      navigate(`/orders/${created.id}`);
    } catch (err: any) {
      setError(err.message || 'ಆರ್ಡರ್ ರಚಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">ಹೊಸ ಆರ್ಡರ್ ರಚಿಸಿ</h2>
          <p className="text-xs text-gray-500 font-medium">ಗ್ರಾಹಕರ ಬಟ್ಟೆ ವಿವರ ಮತ್ತು ಬೆಲೆ ನಮೂದಿಸಿ</p>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 text-red-800 rounded-2xl text-sm font-semibold border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Customer Selection */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ (Customer)
          </label>
          <div className="flex space-x-2">
            <select
              required
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value ? parseInt(e.target.value) : '')}
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- ಗ್ರಾಹಕರನ್ನು ಆಯ್ಕೆಮಾಡಿ --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ''}
                </option>
              ))}
            </select>
            <Link
              to="/customers"
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>ಹೊಸದು</span>
            </Link>
          </div>
        </div>

        {/* 2. Pricing Mode Toggle */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            ಬೆಲೆ ನಿಗದಿಪಡಿಸುವ ವಿಧಾನ (Pricing Mode)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPricingMode('GARMENT_WISE')}
              className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all ${
                pricingMode === 'GARMENT_WISE'
                  ? 'bg-brand-600 text-white border-brand-700 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              ಪ್ರತಿ ಬಟ್ಟೆಗೆ ಪ್ರತ್ಯೇಕ ಬೆಲೆ (Garment-wise)
            </button>
            <button
              type="button"
              onClick={() => setPricingMode('COMBINED')}
              className={`py-3 px-3 rounded-xl border text-xs sm:text-sm font-bold text-center transition-all ${
                pricingMode === 'COMBINED'
                  ? 'bg-brand-600 text-white border-brand-700 shadow-md'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              ಒಟ್ಟು ಒಟ್ಟಾರೆ ಬೆಲೆ (Combined Total)
            </button>
          </div>

          {pricingMode === 'COMBINED' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ಆರ್ಡರ್‌ನ ಒಟ್ಟು ಬೆಲೆ (₹)</label>
              <input
                type="number"
                required
                value={combinedTotal}
                onChange={(e) => setCombinedTotal(e.target.value)}
                placeholder="ಉದಾ: 1500"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-lg font-black text-emerald-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {/* 3. Garments List */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
              ಬಟ್ಟೆಗಳ ವಿವರ (Garment Items)
            </label>
            <button
              type="button"
              onClick={handleAddItem}
              className="text-xs text-brand-700 font-bold flex items-center space-x-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ಇನ್ನೊಂದು ಬಟ್ಟೆ ಸೇರಿಸಿ</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center space-x-2">
                  <select
                    value={item.garment_name}
                    onChange={(e) => handleItemChange(idx, 'garment_name', e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-2.5 py-2 text-sm font-semibold"
                  >
                    {GARMENT_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500 font-semibold">ಸಂಖ್ಯೆ:</span>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center font-bold"
                    />
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {pricingMode === 'GARMENT_WISE' && (
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-gray-500 font-semibold">ಒಂದರ ಬೆಲೆ: ₹</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-gray-800"
                      />
                    </div>
                    <span className="font-extrabold text-sm text-gray-800">
                      ಮೊತ್ತ: ₹{item.line_total}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Computed Total Banner */}
          <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex justify-between items-center">
            <span className="font-extrabold text-brand-900 text-sm">ಒಟ್ಟು ಆರ್ಡರ್ ಬೆಲೆ:</span>
            <span className="font-black text-xl text-brand-700">₹{calculatedOrderTotal()}</span>
          </div>
        </div>

        {/* 4. Advance Payment & Method */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
            ಮುಂಗಡ ಹಣ (Advance Payment - ಐಚ್ಛಿಕ)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                min="0"
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(e.target.value)}
                placeholder="ಅಡ್ವಾನ್ಸ್ ಮೊತ್ತ ₹"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="CASH">ನಗದು (Cash)</option>
                <option value="UPI">ಯುಪಿಐ (PhonePe / GPay)</option>
                <option value="OTHER">ಇತರೆ</option>
              </select>
            </div>
          </div>
        </div>

        {/* 5. Delivery Date & Notes */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              ನಿರೀಕ್ಷಿತ ವಿತರಣಾ ದಿನಾಂಕ (Expected Delivery)
            </label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">
              ವಿಶೇಷ ಸೂಚನೆಗಳು / ಅಳತೆ ಮಾಹಿತಿ (Notes)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ಉದಾ: ಕುತ್ತಿಗೆ ಡಿಸೈನ್, ಹೆಚ್ಚುವರಿ ಲೈನಿಂಗ್..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
        >
          <Check className="w-6 h-6" />
          <span>{loading ? 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...' : 'ಆರ್ಡರ್ ಉಳಿಸಿ (Create Order)'}</span>
        </button>

      </form>
    </div>
  );
};

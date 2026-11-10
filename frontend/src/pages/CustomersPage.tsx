import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customers';
import { Customer } from '../types';
import { Users, Search, UserPlus, Phone, IndianRupee, ArrowRight, X, Check, Sparkles } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (q: string = '') => {
    try {
      setLoading(true);
      const data = await customerService.list(q);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(searchQuery);
  }, [searchQuery]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setError('ಗ್ರಾಹಕರ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await customerService.create(newName.trim(), newPhone.trim() || undefined, newNotes.trim() || undefined);
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
      setNewNotes('');
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setError(err.message || 'ಗ್ರಾಹಕರನ್ನು ಸೇರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Users className="w-6 h-6 text-violet-700" />
            <span>ಗ್ರಾಹಕರ ಪಟ್ಟಿ</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold">ಒಟ್ಟು {customers.length} ಗ್ರಾಹಕರು</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-glow-violet flex items-center space-x-1.5 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>ಹೊಸ ಗ್ರಾಹಕರು</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ಹೆಸರು ಅಥವಾ ಫೋನ್ ನಂಬರ್ ಮೂಲಕ ಹುಡುಕಿ..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm sm:text-base font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
      </div>

      {/* Customer List Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm space-y-3">
          <p className="text-slate-500 font-bold">ಯಾವುದೇ ಗ್ರಾಹಕರು ಕಂಡುಬಂದಿಲ್ಲ</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl text-xs font-black shadow-glow-violet"
          >
            ಮೊದಲ ಗ್ರಾಹಕರನ್ನು ಸೇರಿಸಿ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {customers.map((c) => {
            const hasBalance = c.outstanding_balance > 0;
            return (
              <Link
                key={c.id}
                to={`/customers/${c.id}`}
                className="bg-white rounded-3xl p-4.5 border border-slate-200/80 hover:border-violet-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-base text-slate-900 flex items-center space-x-1.5">
                      <span>{c.name}</span>
                    </h3>
                    {c.phone ? (
                      <p className="text-xs text-slate-500 font-medium flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.phone}</span>
                      </p>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">ಫೋನ್ ನಂಬರ್ ಇಲ್ಲ</span>
                    )}
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-full">
                    {c.orders_count} ಆರ್ಡರ್‌ಗಳು
                  </span>
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">ಒಟ್ಟು ವ್ಯಾಪಾರ</span>
                    <span className="font-extrabold text-slate-700">₹{c.total_order_value}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">ಬಾಕಿ ಹಣ</span>
                    <span className={`font-black text-sm ${hasBalance ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{c.outstanding_balance}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Manual Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-violet-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-violet-700" />
                <span>ಹೊಸ ಗ್ರಾಹಕರನ್ನು ಸೇರಿಸಿ</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl text-xs font-semibold border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಗ್ರಾಹಕರ ಹೆಸರು (ಕಡ್ಡಾಯ)</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="ಉದಾ: ಲಕ್ಷ್ಮಿ, ರಮ್ಯಾ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ಮೊಬೈಲ್ ನಂಬರ್ (ಐಚ್ಛಿಕ)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="ಉದಾ: 9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ವಿಶೇಷ ಟಿಪ್ಪಣಿಗಳು (Notes)</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="ಉದಾ: ರೆಗ್ಯುಲರ್ ಕಸ್ಟಮರ್..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black text-sm shadow-glow-violet flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>ಉಳಿಸಿ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

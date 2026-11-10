import React, { useState, useEffect } from 'react';
import { expenseService } from '../services/expenses';
import { Expense } from '../types';
import { EXPENSE_CATEGORIES } from '../constants/kannada';
import { Receipt, Plus, IndianRupee, Tag, Check, Calendar } from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categorySummary, setCategorySummary] = useState<any[]>([]);
  const [totalExpenseMonth, setTotalExpenseMonth] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // New Expense Form State
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [list, sum] = await Promise.all([
        expenseService.list(),
        expenseService.getSummary(),
      ]);
      setExpenses(list);
      setCategorySummary(sum.category_breakdown || []);
      setTotalExpenseMonth(sum.total_expense || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('ಸರಿಯಾದ ಖರ್ಚಿನ ಮೊತ್ತವನ್ನು ನಮೂದಿಸಿ');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await expenseService.create(category, amt, description || undefined);
      setAmount('');
      setDescription('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'ಖರ್ಚು ದಾಖಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center space-x-2">
          <Receipt className="w-6 h-6 text-brand-700" />
          <span>ಅಂಗಡಿ ಖರ್ಚುಗಳ ನಿರ್ವಹಣೆ</span>
        </h2>
        <p className="text-xs text-gray-500 font-medium">ವಿದ್ಯುತ್, ಬಾಡಿಗೆ, ದಾರ, ಯಂತ್ರ ರಿಪೇರಿ ಮತ್ತು ಇತರೆ ವೆಚ್ಚಗಳು</p>
      </div>

      {/* Monthly Expense Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-3xl p-5 shadow-xl flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">ಈ ತಿಂಗಳ ಒಟ್ಟು ಖರ್ಚು</span>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">₹{totalExpenseMonth.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl">
          <Receipt className="w-8 h-8 text-yellow-400" />
        </div>
      </div>

      {/* Add Expense Form Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-gray-900 flex items-center space-x-1.5">
          <Plus className="w-5 h-5 text-brand-700" />
          <span>ಹೊಸ ಖರ್ಚು ದಾಖಲಿಸಿ</span>
        </h3>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAddExpense} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ಖರ್ಚಿನ ವಿಭಾಗ (Category)</label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    category === cat
                      ? 'bg-brand-700 text-white border-brand-800 shadow'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ಖರ್ಚಾದ ಮೊತ್ತ (₹)</label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ಉದಾ: 250"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-lg font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ವಿವರಣೆ (ಐಚ್ಛಿಕ)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ಉದಾ: 5 ಬಿಳಿ ದಾರದ ರೀಲ್ಸ್, ಆಯಿಲ್ ಬಾಟಲ್..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-base shadow flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>ಖರ್ಚು ಉಳಿಸಿ (Record Expense)</span>
          </button>
        </form>
      </div>

      {/* Recent Expenses List */}
      <div className="space-y-3">
        <h3 className="font-extrabold text-lg text-gray-900">ಇತ್ತೀಚಿನ ಖರ್ಚುಗಳ ಪಟ್ಟಿ ({expenses.length})</h3>
        
        {loading ? (
          <div className="py-6 text-center text-gray-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
        ) : expenses.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border text-center text-sm text-gray-400">
            ಯಾವುದೇ ಖರ್ಚು ದಾಖಲಾಗಿಲ್ಲ
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-3.5 rounded-2xl border border-gray-200 flex justify-between items-center shadow-sm"
              >
                <div>
                  <span className="font-bold text-sm text-gray-900">{exp.category}</span>
                  <p className="text-xs text-gray-500">
                    {exp.description || 'ವಿವರಣೆ ಇಲ್ಲ'} • {new Date(exp.expense_date).toLocaleDateString('kn-IN')}
                  </p>
                </div>
                <span className="font-black text-base text-red-600">-₹{exp.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

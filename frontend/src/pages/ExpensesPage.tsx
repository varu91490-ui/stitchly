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
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
          <Receipt className="w-6 h-6 text-violet-700" />
          <span>ಅಂಗಡಿ ಖರ್ಚುಗಳ ನಿರ್ವಹಣೆ</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">ವಿದ್ಯುತ್, ಬಾಡಿಗೆ, ದಾರ, ಯಂತ್ರ ರಿಪೇರಿ ಮತ್ತು ಇತರೆ ಅಂಗಡಿ ವೆಚ್ಚಗಳು</p>
      </div>

      {/* Monthly Expense Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-violet-800/40 flex justify-between items-center">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[11px] font-black text-amber-300 uppercase tracking-wider">ಈ ತಿಂಗಳ ಒಟ್ಟು ಖರ್ಚು</span>
          <p className="text-3xl sm:text-4xl font-black text-white mt-1">₹{totalExpenseMonth.toLocaleString('en-IN')}</p>
        </div>
        <div className="relative z-10 p-3.5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-sm">
          <Receipt className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Add Expense Form Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-black text-base text-slate-900 flex items-center space-x-1.5">
          <Plus className="w-5 h-5 text-violet-700" />
          <span>ಹೊಸ ಖರ್ಚು ದಾಖಲಿಸಿ</span>
        </h3>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-800 rounded-2xl text-xs font-bold border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">ಖರ್ಚಿನ ವಿಭಾಗ (Category)</label>
            <div className="flex flex-wrap gap-1.5">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    category === cat
                      ? 'bg-violet-700 text-white border-violet-800 shadow-glow-violet'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ಖರ್ಚಾದ ಮೊತ್ತ (₹)</label>
            <input
              type="number"
              step="any"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="ಉದಾ: 250"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xl font-black text-rose-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ವಿವರಣೆ (ಐಚ್ಛಿಕ)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ಉದಾ: 5 ಬಿಳಿ ದಾರದ ರೀಲ್ಸ್, ಆಯಿಲ್ ಬಾಟಲ್..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-glow-violet flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
          >
            <Check className="w-5 h-5" />
            <span>ಖರ್ಚು ಉಳಿಸಿ (Record Expense)</span>
          </button>
        </form>
      </div>

      {/* Recent Expenses List */}
      <div className="space-y-3">
        <h3 className="font-black text-lg text-slate-900">ಇತ್ತೀಚಿನ ಖರ್ಚುಗಳ ಪಟ್ಟಿ ({expenses.length})</h3>
        
        {loading ? (
          <div className="py-6 text-center text-slate-400 font-bold">ಲೋಡ್ ಆಗುತ್ತಿದೆ...</div>
        ) : expenses.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center text-sm text-slate-400 font-medium">
            ಯಾವುದೇ ಖರ್ಚು ದಾಖಲಾಗಿಲ್ಲ
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-white p-4 rounded-3xl border border-slate-200/80 flex justify-between items-center shadow-sm hover:border-slate-300 transition-all"
              >
                <div>
                  <span className="font-black text-sm text-slate-900">{exp.category}</span>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {exp.description || 'ವಿವರಣೆ ಇಲ್ಲ'} • {new Date(exp.expense_date).toLocaleDateString('kn-IN')}
                  </p>
                </div>
                <span className="font-black text-base text-rose-600">-₹{exp.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

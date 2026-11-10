import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reports';
import { DailyReport, MonthlyReport } from '../types';
import { BarChart3, Calendar, Printer, IndianRupee, TrendingUp, CheckCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  
  // Date pickers
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        if (viewMode === 'DAILY') {
          const d = await reportService.getDaily(selectedDate);
          setDailyReport(d);
        } else {
          const m = await reportService.getMonthly(selectedYear, selectedMonth);
          setMonthlyReport(m);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [viewMode, selectedDate, selectedMonth, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Title & Print Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-violet-700" />
            <span>ವ್ಯಾಪಾರ ಮತ್ತು ಹಣಕಾಸು ವರದಿಗಳು</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">ನಿಖರ ಲೆಕ್ಕಪತ್ರ • ದಿನದ ಮತ್ತು ತಿಂಗಳ ಸಾರಾಂಶ</p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-sm active:scale-95"
        >
          <Printer className="w-4 h-4 text-violet-700" />
          <span>ಪ್ರಿಂಟ್ (PDF)</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setViewMode('DAILY')}
          className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
            viewMode === 'DAILY' ? 'bg-white text-violet-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ದೈನಂದಿನ ವರದಿ (Daily)
        </button>
        <button
          onClick={() => setViewMode('MONTHLY')}
          className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${
            viewMode === 'MONTHLY' ? 'bg-white text-violet-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ಮಾಸಿಕ ವರದಿ (Monthly)
        </button>
      </div>

      {/* Date Pickers */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-violet-700" />
          <span>ದಿನಾಂಕ ಆಯ್ಕೆ:</span>
        </span>
        {viewMode === 'DAILY' ? (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-slate-300 rounded-2xl px-3 py-1.5 text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800"
          />
        ) : (
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="border border-slate-300 rounded-2xl px-3 py-1.5 text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-violet-500 text-slate-800"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>ತಿಂಗಳು {m}</option>
              ))}
            </select>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-20 border border-slate-300 rounded-2xl px-2 py-1.5 text-sm font-semibold bg-slate-50 text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold">ವರದಿ ತಯಾರಾಗುತ್ತಿದೆ...</div>
      ) : viewMode === 'DAILY' && dailyReport ? (
        <div className="space-y-4">
          
          {/* Key Distinction Card: Collections vs Expenses vs Net Cash */}
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-violet-800/40 space-y-4">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                ದಿನದ ನಗದು ಹರಿವು (Daily Cash Movement)
              </span>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-xs text-violet-200 font-medium">ವಸೂಲಾದ ನಗದು - ಖರ್ಚುಗಳು</p>
                  <p className="text-3xl sm:text-4xl font-black mt-1">₹{dailyReport.net_cash_movement}</p>
                </div>
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-sm ${dailyReport.net_cash_movement >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {dailyReport.net_cash_movement >= 0 ? '+ ನಿವ್ವಳ ಲಾಭ' : '- ನಷ್ಟ'}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-4.5 rounded-3xl border border-emerald-200 shadow-sm">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">ವಸೂಲಾದ ಪಾವತಿ (Cash In)</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹{dailyReport.total_payments_collected}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಇಂದು ಪಡೆದ ನಿಜವಾದ ಹಣ</p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 via-pink-50/40 to-white p-4.5 rounded-3xl border border-rose-200 shadow-sm">
              <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">ಒಟ್ಟು ಖರ್ಚುಗಳು (Cash Out)</span>
              <p className="text-2xl font-black text-rose-600 mt-1">₹{dailyReport.total_expenses}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಅಂಗಡಿಯ ಇಂದಿನ ವೆಚ್ಚ</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 via-purple-50/40 to-white p-4.5 rounded-3xl border border-violet-200 shadow-sm">
              <span className="text-[11px] font-black text-violet-800 uppercase tracking-wider">ಹೊಸ ಆರ್ಡರ್ ಮೌಲ್ಯ</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{dailyReport.total_order_value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{dailyReport.total_orders_created} ಹೊಸ ಆರ್ಡರ್‌ಗಳು</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 via-yellow-50/40 to-white p-4.5 rounded-3xl border border-amber-200 shadow-sm">
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">ವಿತರಿಸಲಾದ ಬಟ್ಟೆಗಳು</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{dailyReport.orders_delivered_count}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಗ್ರಾಹಕರಿಗೆ ತಲುಪಿದ ಆರ್ಡರ್‌ಗಳು</p>
            </div>
          </div>

        </div>
      ) : viewMode === 'MONTHLY' && monthlyReport ? (
        <div className="space-y-4">
          
          {/* Monthly Net Cash Movement */}
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-violet-800/40 space-y-4">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                ತಿಂಗಳ ನಿವ್ವಳ ನಗದು (Monthly Net Cash Movement)
              </span>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <p className="text-xs text-violet-200 font-medium">ಒಟ್ಟು ವಸೂಲಿ - ಒಟ್ಟು ಖರ್ಚು</p>
                  <p className="text-3xl sm:text-4xl font-black mt-1">₹{monthlyReport.net_cash_movement}</p>
                </div>
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-2xl shadow-sm ${monthlyReport.net_cash_movement >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  {monthlyReport.net_cash_movement >= 0 ? '+ ಧನಾತ್ಮಕ ಉಳಿತಾಯ' : '- ಕೊರತೆ'}
                </span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white p-4.5 rounded-3xl border border-emerald-200 shadow-sm">
              <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider">ತಿಂಗಳ ವಸೂಲಿ (Collections)</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">₹{monthlyReport.total_payments_collected}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಪಡೆದ ನಿಜವಾದ ನಗದು</p>
            </div>

            <div className="bg-gradient-to-br from-rose-50 via-pink-50/40 to-white p-4.5 rounded-3xl border border-rose-200 shadow-sm">
              <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider">ತಿಂಗಳ ಖರ್ಚುಗಳು (Expenses)</span>
              <p className="text-2xl font-black text-rose-600 mt-1">₹{monthlyReport.total_expenses}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಬಾಡಿಗೆ, ಕರೆಂಟ್, ಸಾಮಗ್ರಿಗಳು</p>
            </div>

            <div className="bg-gradient-to-br from-violet-50 via-purple-50/40 to-white p-4.5 rounded-3xl border border-violet-200 shadow-sm">
              <span className="text-[11px] font-black text-violet-800 uppercase tracking-wider">ಒಟ್ಟು ಆರ್ಡರ್ ಮೌಲ್ಯ</span>
              <p className="text-2xl font-black text-slate-900 mt-1">₹{monthlyReport.total_order_value}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">{monthlyReport.total_customers_served} ಗ್ರಾಹಕರು</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 via-yellow-50/40 to-white p-4.5 rounded-3xl border border-amber-200 shadow-sm">
              <span className="text-[11px] font-black text-amber-800 uppercase tracking-wider">ಉಳಿದ ಬಾಕಿ ಹಣ</span>
              <p className="text-2xl font-black text-amber-600 mt-1">₹{monthlyReport.total_outstanding_balance}</p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">ಗ್ರಾಹಕರಿಂದ ಬರಬೇಕಾದ ಬಾಕಿ</p>
            </div>
          </div>

        </div>
      ) : null}

      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 p-4 rounded-3xl border border-violet-200 text-xs text-violet-950 font-medium shadow-sm">
        💡 <strong>ನೆನಪಿಡಿ:</strong> ಆರ್ಡರ್ ಮೌಲ್ಯ (Order Value) ಎಂದರೆ ಕೆಲಸದ ಒಪ್ಪಂದ. ವಸೂಲಾದ ಹಣ (Money Received) ಮಾತ್ರ ನಿಮ್ಮ ಕೈಗೆ ಬಂದ ನಿಜವಾದ ಆದಾಯ.
      </div>

    </div>
  );
};

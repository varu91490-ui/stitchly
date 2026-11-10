import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Truck, BarChart3, Mic, RefreshCw, Sparkles } from 'lucide-react';
import { APP_NAME } from '../constants/kannada';

interface NavbarProps {
  onOpenVoice: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice, isOffline }) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-violet-950 via-indigo-900 to-purple-950 text-white shadow-lg border-b border-violet-800/30">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-glow-amber text-xl">
              ✂️
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-wide text-white drop-shadow-sm flex items-center space-x-1.5">
                <span>{APP_NAME}</span>
                <Sparkles className="w-4 h-4 text-amber-300 inline" />
              </h1>
              <p className="text-[11px] font-semibold text-violet-200">
                ಕನ್ನಡ ಧ್ವನಿ ಆಧಾರಿತ ಟೈಲರಿಂಗ್ ಲೆಕ್ಕಪತ್ರ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOffline && (
              <span className="bg-amber-400 text-amber-950 text-xs px-2.5 py-1 rounded-full font-bold shadow animate-pulse">
                ಆಫ್‌ಲೈನ್
              </span>
            )}
            
            <button
              onClick={() => window.location.reload()}
              title="ರೀಫ್ರೆಶ್ ಮಾಡಿ (Refresh)"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-violet-100 hover:text-white transition-all active:rotate-180"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Center Voice Button (Bottom Center) */}
      <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={onOpenVoice}
          className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 text-white rounded-full flex flex-col items-center justify-center shadow-glow-violet ring-4 ring-white active:scale-90 hover:scale-105 transition-all"
          aria-label="ಧ್ವನಿ ಸಹಾಯಕ"
        >
          <Mic className="w-8 h-8 text-yellow-200 drop-shadow-md" />
          <span className="text-[10px] font-black tracking-wider uppercase text-yellow-100">ಧ್ವನಿ</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-8px_30px_rgb(0,0,0,0.06)]">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16 px-1">
          
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-all ${
                isActive ? 'text-violet-700 scale-105' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="mt-0.5">ಮುಖ್ಯ ಪುಟ</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-all ${
                isActive ? 'text-violet-700 scale-105' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                  <Users className="w-5 h-5" />
                </div>
                <span className="mt-0.5">ಗ್ರಾಹಕರು</span>
              </>
            )}
          </NavLink>

          {/* Spacer for Floating Voice Mic */}
          <div className="w-14 sm:w-16 pointer-events-none" />

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-all ${
                isActive ? 'text-violet-700 scale-105' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="mt-0.5">ಆರ್ಡರ್‌ಗಳು</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/deliveries"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-all ${
                isActive ? 'text-violet-700 scale-105' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <span className="mt-0.5">ವಿತರಣೆ</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-all ${
                isActive ? 'text-violet-700 scale-105' : 'text-slate-400 hover:text-slate-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="mt-0.5">ವರದಿಗಳು</span>
              </>
            )}
          </NavLink>

        </div>
      </nav>
    </>
  );
};

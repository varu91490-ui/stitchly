import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Truck, Receipt, BarChart3, LogOut, Mic } from 'lucide-react';
import { APP_NAME } from '../constants/kannada';

interface NavbarProps {
  onOpenVoice: () => void;
  userName?: string;
  onLogout: () => void;
  isOffline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice, userName, onLogout, isOffline }) => {
  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-brand-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✂️</span>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold tracking-wide">{APP_NAME}</h1>
              {userName && (
                <p className="text-xs text-brand-200">
                  ಖಾತೆದಾರರು: <span className="font-bold text-white">{userName}</span>
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isOffline && (
              <span className="bg-amber-400 text-amber-950 text-xs px-2.5 py-1 rounded-full font-bold shadow animate-pulse">
                ಆಫ್‌ಲೈನ್ (Offline)
              </span>
            )}
            
            <button
              onClick={onLogout}
              title="ಲಾಗ್‌ಔಟ್ (Logout)"
              className="p-2 rounded-xl bg-brand-800 hover:bg-brand-900 text-brand-100 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Center Voice Button (Bottom Center) */}
      <div className="fixed bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40">
        <button
          type="button"
          onClick={onOpenVoice}
          className="w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-tr from-brand-700 to-red-500 text-white rounded-full flex flex-col items-center justify-center shadow-2xl ring-4 ring-white active:scale-90 transition-transform"
          aria-label="ಧ್ವನಿ ಸಹಾಯಕ"
        >
          <Mic className="w-8 h-8 text-yellow-300" />
          <span className="text-[10px] font-bold tracking-tight">ಧ್ವನಿ</span>
        </button>
      </div>

      {/* Bottom Navigation Bar (Thumb Friendly Mobile Layout) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-around items-center h-16 px-1">
          
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-colors ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>ಮುಖ್ಯ ಪುಟ</span>
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-colors ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>ಗ್ರಾಹಕರು</span>
          </NavLink>

          {/* Spacer for Floating Voice Mic */}
          <div className="w-12 sm:w-16 pointer-events-none" />

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-colors ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            <span>ಆರ್ಡರ್‌ಗಳು</span>
          </NavLink>

          <NavLink
            to="/deliveries"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-colors ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span>ವಿತರಣೆ</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition-colors ${
                isActive ? 'text-brand-700' : 'text-gray-500 hover:text-gray-800'
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span>ವರದಿಗಳು</span>
          </NavLink>

        </div>
      </nav>
    </>
  );
};

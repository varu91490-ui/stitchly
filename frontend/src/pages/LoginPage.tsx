import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { APP_NAME, APP_TAGLINE } from '../constants/kannada';
import { Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [name, setName] = useState<string>('ಅಮ್ಮ');
  const [username, setUsername] = useState<string>('mother_tailor');
  const [password, setPassword] = useState<string>('tailor123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await authService.register(name, username, password);
      } else {
        await authService.login(username, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'ಲಾಗಿನ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-700 via-brand-600 to-brand-800 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-brand-200">
        
        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-50 rounded-full mb-3 shadow-inner border border-brand-200">
            <span className="text-4xl">✂️</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{APP_NAME}</h1>
          <p className="text-sm font-semibold text-brand-700 mt-1">{APP_TAGLINE}</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2.5 text-center font-bold text-sm rounded-lg transition-all ${
              !isRegister ? 'bg-white text-brand-700 shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            ಲಾಗಿನ್ (Login)
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2.5 text-center font-bold text-sm rounded-lg transition-all ${
              isRegister ? 'bg-white text-brand-700 shadow' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            ಹೊಸ ಖಾತೆ ರಚಿಸಿ (Register)
          </button>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 mb-4 bg-red-50 text-red-800 rounded-xl text-sm border border-red-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ನಿಮ್ಮ ಹೆಸರು (Full Name)</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ಉದಾ: ಲಕ್ಷ್ಮಿ ಅಮ್ಮ"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username)</label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ಉದಾ: mother_tailor"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ಪಾಸ್‌ವರ್ಡ್ (Password)</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all mt-6 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...</span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{isRegister ? 'ಖಾತೆ ತೆರೆಯಿರಿ' : 'ಪ್ರವೇಶಿಸಿ (Login)'}</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6 font-medium">
          ಸುರಕ್ಷಿತ ಮತ್ತು ಸರಳ ಕನ್ನಡ ಟೈಲರಿಂಗ್ ಖಾತೆ ವ್ಯವಸ್ಥೆ
        </p>

      </div>
    </div>
  );
};

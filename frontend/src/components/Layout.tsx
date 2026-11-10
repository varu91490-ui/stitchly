import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { VoiceAssistantModal } from './VoiceAssistantModal';
import { authService } from '../services/auth';
import { User } from '../types';

export const Layout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch user profile
    authService.getMe()
      .then(setCurrentUser)
      .catch(() => {
        // Handled in api.ts
      });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar
        onOpenVoice={() => setIsVoiceOpen(true)}
        userName={currentUser?.name}
        onLogout={handleLogout}
        isOffline={isOffline}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-28">
        <Outlet />
      </main>

      {/* Global Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSuccess={() => {
          // Trigger reload or update
          window.dispatchEvent(new Event('order_updated'));
        }}
      />
    </div>
  );
};

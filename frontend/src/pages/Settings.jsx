import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Settings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    const saved = localStorage.getItem('innervoice-theme');
    if (saved === 'dark') {
      setDarkMode(true);
    }
  }, [isAuthenticated, navigate]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('innervoice-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('innervoice-theme', 'light');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">⚙️</span> Settings
        </h1>
        <p className="text-gray-500 text-sm mt-1">Customize your InnerVoice experience</p>
      </div>

      <div className="space-y-4 animate-slide-up">
        {/* Dark Mode */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-base">🌙</span> Dark Mode
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {darkMode ? 'Dark theme is active' : 'Switch to dark theme'}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                darkMode ? 'bg-brand-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Notifications Placeholder */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-base">🔔</span> Notifications
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-medium">
              Soon
            </span>
          </div>
        </div>

        {/* Privacy Placeholder */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-base">🔒</span> Privacy
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-medium">
              Soon
            </span>
          </div>
        </div>

        {/* Account Placeholder */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <span className="text-base">👤</span> Account
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Coming soon</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-400 text-xs font-medium">
              Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

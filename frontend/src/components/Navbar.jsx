import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-md shadow-brand-200/50 group-hover:shadow-lg group-hover:shadow-brand-200/70 transition-all duration-300">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              InnerVoice
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/" className="btn-ghost text-sm">Home</Link>
            <Link to="/write" className="btn-ghost text-sm">Write</Link>
            {isAuthenticated() && (
              <Link to="/mood-journal" className="btn-ghost text-sm">Mood Journal</Link>
            )}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated() ? (
              <>
                <Link
                  to="/edit-profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {user?.profile_picture_url ? (
                    <img
                      src={user.profile_picture_url}
                      alt={user.username}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="btn-ghost text-sm text-red-500 hover:text-red-600 hover:bg-red-50">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Register</Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 animate-fade-in">
            <div className="flex flex-col gap-1">
              <Link to="/" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/write" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Write</Link>
              {isAuthenticated() && (
                <>
                  <Link to="/dashboard" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <Link to="/mood-journal" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Mood Journal</Link>
                  <button onClick={handleLogout} className="btn-ghost text-sm justify-start text-red-500 hover:text-red-600 hover:bg-red-50">Logout</button>
                </>
              )}
              {!isAuthenticated() && (
                <>
                  <Link to="/login" className="btn-ghost text-sm justify-start" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary text-sm mt-1" onClick={() => setMobileOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

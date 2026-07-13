import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, getMe } from '../api/auth';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const OTP_TIMER_SECONDS = 600; // 10 minutes

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
    return () => clearInterval(timerRef.current);
  }, [isAuthenticated, navigate]);

  const startTimer = () => {
    setSecondsLeft(OTP_TIMER_SECONDS);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    setSending(true);
    try {
      await sendOtp({ email: user.email });
      setOtpSent(true);
      startTimer();
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    setVerifying(true);
    try {
      await verifyOtp({ email: user.email, otp });
      // Refresh user data
      const res = await getMe();
      setUser(res.data);
      toast.success('Email verified successfully! ✅');
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  if (user.is_verified) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 text-center max-w-sm w-full animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Already Verified</h2>
          <p className="text-sm text-gray-500 mt-1">Your email is already verified.</p>
          <button onClick={() => navigate('/profile')} className="btn-primary text-sm mt-5">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-500 text-sm mt-1">
            We'll send a verification code to <strong className="text-gray-700">{user.email}</strong>
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8">
          {!otpSent ? (
            <div className="text-center">
              <button
                onClick={handleSendOtp}
                disabled={sending}
                className="btn-primary w-full py-3"
              >
                {sending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send OTP to my email'
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  autoFocus
                />
              </div>

              {/* Timer */}
              {secondsLeft > 0 ? (
                <p className="text-xs text-gray-400 text-center">
                  Code expires in <span className="font-medium text-brand-500">{formatTimer(secondsLeft)}</span>
                </p>
              ) : (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sending}
                    className="text-xs text-brand-500 font-medium hover:text-brand-600 transition-colors"
                  >
                    {sending ? 'Sending...' : 'Resend OTP'}
                  </button>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={verifying || otp.length !== 6}
                className="btn-primary w-full py-3"
              >
                {verifying ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

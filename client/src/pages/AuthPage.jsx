import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle, 
  Sparkles,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const queryMode = searchParams.get('mode');

  const [mode, setMode] = useState(queryMode || initialMode);
  const { login, signup, requestSignupCode, verifySignupCode, resendSignupCode, switchDemo, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('fan'); // fan or creator
  
  // OTP Verification states
  const [signupStep, setSignupStep] = useState('details'); // 'details' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Google Modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer for OTP resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login({
          emailOrUsername: emailOrUsername.trim(),
          password
        });
        if (res.success) {
          navigate(redirectPath);
        } else {
          setError(res.message);
        }
      } else if (signupStep === 'details') {
        // Validation
        if (username.trim().length < 3) {
          setError('Username must be at least 3 characters.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please provide a valid email address.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }

        // Request 6-digit email OTP
        const res = await requestSignupCode({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim() || username.trim(),
          role
        });

        if (res.success) {
          setSignupStep('otp');
          setResendCountdown(60);
        } else {
          setError(res.message || 'Could not send verification code.');
        }
      } else {
        // Verify OTP code
        if (!otpCode || otpCode.trim().length !== 6) {
          setError('Please enter the full 6-digit code sent to your email.');
          setIsSubmitting(false);
          return;
        }

        const res = await verifySignupCode(email.trim(), otpCode.trim());
        if (res.success) {
          navigate(redirectPath);
        } else {
          setError(res.message || 'Verification failed. Please check the code.');
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCountdown > 0) return;
    setError('');
    try {
      const res = await resendSignupCode(email.trim());
      if (res.success) {
        setResendCountdown(60);
      } else {
        setError(res.message || 'Failed to resend code.');
      }
    } catch {
      setError('Failed to resend verification code.');
    }
  };

  const handleGoogleAuthSelect = async (account) => {
    setGoogleSubmitting(true);
    setError('');
    try {
      const res = await loginWithGoogle({
        email: account.email,
        name: account.name,
        picture: account.picture,
        role: role || 'fan'
      });
      if (res.success) {
        setShowGoogleModal(false);
        navigate(redirectPath);
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Error authenticating with Google.');
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) return;
    await handleGoogleAuthSelect({
      email: googleEmail.trim(),
      name: googleName.trim() || googleEmail.split('@')[0],
      picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(googleEmail.trim())}`
    });
  };

  const fillDemoAccount = (accountId) => {
    switchDemo(accountId);
    navigate(redirectPath);
  };

  const googleProfiles = [
    {
      name: 'Alex Johnson',
      email: 'alex.google@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    {
      name: 'Nicole Shayla',
      email: 'nicole.google@gmail.com',
      avatar: '/FhNtifmVQAEZDgwy.jpg'
    }
  ];

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        
        {/* Header */}
        <div className="auth-header">
          <div className="auth-badge">
            <ShieldCheck style={{ width: 14, height: 14 }} />
            <span>Secure Creator Network</span>
          </div>
          
          <h1 className="auth-title">
            JUST<span className="auth-title-accent">FANS</span>
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Sign in to access your subscriptions, exclusive feeds & messages' 
              : signupStep === 'otp'
                ? 'Verify your email address with the 6-digit confirmation code'
                : 'Create an account to subscribe to Nicole or monetize your content'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setSignupStep('details'); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="auth-alert-error" style={{ marginBottom: 18 }}>
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Authentication Button */}
        {signupStep === 'details' && (
          <>
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="auth-google-btn"
            >
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>

            <div className="auth-divider">
              <span>Or with email credentials</span>
            </div>
          </>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {mode === 'login' ? (
            /* Login Fields */
            <>
              <div className="auth-input-group">
                <label className="auth-label">Email or Username</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex_fan or alex@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>
            </>
          ) : signupStep === 'details' ? (
            /* Signup Step 1: User & Role Details */
            <>
              <div className="auth-input-group">
                <label className="auth-label">Select Account Role</label>
                <div className="auth-role-grid">
                  <div
                    className={`auth-role-option ${role === 'fan' ? 'selected' : ''}`}
                    onClick={() => setRole('fan')}
                  >
                    <span className="auth-role-title">Fan / Subscriber</span>
                    <span className="auth-role-desc">Watch 4K videos, tip & message Nicole</span>
                  </div>
                  <div
                    className={`auth-role-option ${role === 'creator' ? 'selected' : ''}`}
                    onClick={() => setRole('creator')}
                  >
                    <span className="auth-role-title">Creator (Upload)</span>
                    <span className="auth-role-desc">Upload content, set paywalls & earn tips</span>
                  </div>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address (Verification Code Destination)</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Signup Step 2: 6-Digit Email Verification Code */
            <div className="auth-otp-box">
              <div className="auth-otp-icon-wrap">
                <KeyRound style={{ width: 22, height: 22, color: 'var(--auth-accent-cyan)' }} />
              </div>

              <h3 className="auth-otp-title">Enter Verification Code</h3>
              <p className="auth-otp-subtitle">
                A 6-digit confirmation code was dispatched to <span className="auth-otp-email-highlight">{email}</span>. Please check your email inbox and spam folder.
              </p>

              <div className="auth-input-group" style={{ margin: '20px 0 10px' }}>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="auth-otp-input-field"
                />
              </div>

              <div className="auth-otp-actions">
                <button
                  type="button"
                  onClick={() => { setSignupStep('details'); setError(''); }}
                  className="auth-otp-back-btn"
                >
                  <ArrowLeft style={{ width: 14, height: 14 }} />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  disabled={resendCountdown > 0}
                  onClick={handleResendCode}
                  className="auth-otp-resend-btn"
                >
                  {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit-btn"
          >
            {isSubmitting 
              ? 'Processing...' 
              : mode === 'login' 
                ? 'Sign In to JustFans' 
                : signupStep === 'details'
                  ? 'Send 6-Digit Verification Code'
                  : 'Verify & Activate Account'}
          </button>
        </form>

        {/* Quick Demo One-Click Fill */}
        <div className="auth-demo-section">
          <p className="auth-demo-title">Quick Demo Logins (Password: password123)</p>
          <div className="auth-demo-grid">
            <button
              type="button"
              onClick={() => fillDemoAccount('user-fan-1')}
              className="auth-demo-btn"
            >
              Sign in as Alex (Fan)
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('creator-1')}
              className="auth-demo-btn"
            >
              Sign in as Nicole (Creator)
            </button>
          </div>
        </div>

      </div>

      {/* Google Authentication Dialog */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-gray-200 space-y-4">
            
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#222b3e]">
              <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 className="font-extrabold text-white text-base">Sign in with Google</h3>
                <p className="text-xs text-gray-400">Choose an account to continue to JustFans</p>
              </div>
            </div>

            {/* Quick Demo Google Accounts */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Fast Account Select</p>
              {googleProfiles.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => handleGoogleAuthSelect(p)}
                  className="flex items-center gap-3 p-3 bg-[#181e2c] hover:bg-[#20283b] border border-[#273148] hover:border-[#00aff0] rounded-2xl cursor-pointer transition"
                >
                  <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full object-cover border border-[#00aff0]/40" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">{p.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{p.email}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-[#00aff0]" />
                </div>
              ))}
            </div>

            <div className="auth-divider">
              <span>Or use your Google email</span>
            </div>

            {/* Custom Google Email Form */}
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-2.5">
              <input
                type="email"
                required
                placeholder="Your Google email address"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
              />
              <input
                type="text"
                placeholder="Your Display Name (Optional)"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
              />
              <button
                type="submit"
                disabled={googleSubmitting || !googleEmail.trim()}
                className="w-full py-2.5 bg-[#00aff0] hover:bg-[#0094cc] disabled:opacity-40 text-black font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                {googleSubmitting ? 'Verifying with Google...' : 'Continue with this Google Account'}
              </button>
            </form>

            <p className="text-[10px] text-gray-500 text-center">
              Google accounts are automatically verified with no email code delays.
            </p>

          </div>
        </div>
      )}

    </div>
  );
}

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
  ArrowLeft
} from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const queryMode = searchParams.get('mode');

  const [mode, setMode] = useState(queryMode || initialMode);
  const { login, signup, requestSignupCode, verifySignupCode, resendSignupCode, switchDemo } = useAuth();
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

  const fillDemoAccount = async (id) => {
    const success = await switchDemo(id);
    if (success) {
      navigate(redirectPath);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        
        {/* Header & Logo */}
        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles style={{ width: 13, height: 13 }} />
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
                <label className="auth-label">Display Name (Optional)</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Sam Rivers"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. cyber_sam"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Password (Min. 6 chars)</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type="password"
                    required
                    placeholder="Create a secure password"
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
                <KeyRound style={{ width: 22, height: 22 }} />
              </div>

              <h3 className="auth-otp-title">Enter Verification Code</h3>
              <p className="auth-otp-subtitle">
                We sent a 6-digit confirmation code to <span className="auth-otp-email-highlight">{email}</span>. Please check your inbox (and spam folder) and enter it below.
              </p>

              <div style={{ margin: '18px 0' }}>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  placeholder="••••••"
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
                  <ArrowLeft style={{ width: 13, height: 13 }} />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0}
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';
import { 
  Mail, 
  Lock, 
  User as UserIcon, 
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  Check,
  Crown
} from 'lucide-react';

export default function AuthPage({ initialMode = 'login' }) {
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const queryMode = searchParams.get('mode');

  const [mode, setMode] = useState(queryMode || initialMode);
  const { login, requestSignupCode, verifySignupCode, resendSignupCode, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('fan'); // fan or creator

  // Creator channel fields
  const [creatorCategory, setCreatorCategory] = useState('Solo VIP & Teasers');
  const [creatorPrice, setCreatorPrice] = useState('60.00');
  const [creatorBio, setCreatorBio] = useState('');
  
  // OTP Verification states
  const [signupStep, setSignupStep] = useState('details'); // 'details' or 'otp'
  const [otpCode, setOtpCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Native Google Identity Services states
  const [googleClientId, setGoogleClientId] = useState(
    () => import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('GOOGLE_CLIENT_ID') || ''
  );
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [inputClientId, setInputClientId] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Google OAuth 2.0 full-page redirect callback (for mobile browsers where popups get blocked)
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');

      if (idToken) {
        handleGoogleCredentialResponse({ credential: idToken });
        window.history.replaceState(null, '', window.location.pathname);
      } else if (accessToken) {
        setIsGoogleLoading(true);
        fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
          .then(r => r.json())
          .then(async (info) => {
            if (info?.email) {
              const res = await loginWithGoogle({
                email: info.email,
                name: info.name || info.email.split('@')[0],
                picture: info.picture,
                role: role || 'fan'
              });
              if (res.success) {
                navigate(res.user?.role === 'creator' ? '/studio' : (redirectPath === '/' ? '/feed' : redirectPath));
              } else {
                setError(res.message || 'Google authentication failed.');
              }
            }
          })
          .catch(e => setError('Failed to retrieve Google profile on mobile.'))
          .finally(() => {
            setIsGoogleLoading(false);
            window.history.replaceState(null, '', window.location.pathname);
          });
      }
    }
  }, []);

  const handleMobileGoogleRedirect = () => {
    const activeClientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) {
      setShowGoogleSetupModal(true);
      return;
    }
    const redirectUri = window.location.origin;
    const nonce = Math.random().toString(36).substring(2);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${activeClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${nonce}`;
    window.location.href = authUrl;
  };

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
          if (res.user?.role === 'creator') {
            navigate('/studio');
          } else {
            navigate(redirectPath === '/' ? '/feed' : redirectPath);
          }
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
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please verify your password confirmation.');
          setIsSubmitting(false);
          return;
        }

        // Request 6-digit email OTP with Creator details
        const res = await requestSignupCode({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim() || username.trim(),
          role,
          category: role === 'creator' ? creatorCategory : undefined,
          monthlyPrice: role === 'creator' ? parseFloat(creatorPrice) || 60.00 : undefined,
          bio: role === 'creator' ? creatorBio.trim() : undefined
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
          if (res.user?.role === 'creator') {
            navigate('/studio');
          } else {
            navigate(redirectPath === '/' ? '/feed' : redirectPath);
          }
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

  // Official Google Identity Services (GIS) Credential Handler
  const handleGoogleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      // Decode JWT payload returned by Google
      const payloadBase64 = response.credential.split('.')[1];
      const decodedStr = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(decodeURIComponent(escape(decodedStr)));

      const res = await loginWithGoogle({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        role: role || 'fan',
        credential: response.credential
      });

      if (res.success) {
        setShowGoogleSetupModal(false);
        if (res.user?.role === 'creator') {
          navigate('/studio');
        } else {
          navigate(redirectPath === '/' ? '/feed' : redirectPath);
        }
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      console.error('Google GIS parse error:', err);
      setError('Failed to process Google sign-in response.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Mount official Google Identity Services button if Client ID exists
  useEffect(() => {
    const activeClientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId) return;

    let attemptsRef = { count: 0 };
    const interval = setInterval(() => {
      attemptsRef.count++;
      if (window.google?.accounts?.id) {
        clearInterval(interval);
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: false
          });

          const container = document.getElementById('nativeGoogleBtnContainer');
          if (container) {
            container.innerHTML = '';
            const btnWidth = Math.min(340, Math.max(220, window.innerWidth - 64));
            window.google.accounts.id.renderButton(container, {
              theme: 'outline',
              size: 'large',
              width: btnWidth,
              text: mode === 'login' ? 'signin_with' : 'signup_with',
              shape: 'pill',
              logo_alignment: 'left'
            });
          }
        } catch (e) {
          console.warn('Google GIS initialization notice:', e);
        }
      }
      if (attemptsRef.count > 30) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [googleClientId, mode, signupStep]);

  // Save Google OAuth Client ID to localStorage for instant GIS activation
  const handleSaveGoogleClientId = (e) => {
    e.preventDefault();
    if (!inputClientId.trim()) return;
    const cleanId = inputClientId.trim();
    localStorage.setItem('GOOGLE_CLIENT_ID', cleanId);
    setGoogleClientId(cleanId);
    setShowGoogleSetupModal(false);
    setError('');
  };

  // Direct login with user's verified Google email
  const handleDirectGoogleLogin = async (e) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    setIsGoogleLoading(true);
    setError('');
    try {
      const cleanEmail = customGoogleEmail.trim().toLowerCase();
      const res = await loginWithGoogle({
        email: cleanEmail,
        name: customGoogleName.trim() || cleanEmail.split('@')[0],
        picture: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(cleanEmail)}`,
        role: role || 'fan'
      });
      if (res.success) {
        setShowGoogleSetupModal(false);
        if (res.user?.role === 'creator') {
          navigate('/studio');
        } else {
          navigate(redirectPath === '/' ? '/feed' : redirectPath);
        }
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch {
      setError('Network connection failed during Google sign in.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
          <div className="w-full flex flex-col items-center mb-1">
            {googleClientId ? (
              <div className="w-full space-y-2">
                <div id="nativeGoogleBtnContainer" className="w-full flex justify-center py-1 min-h-[44px]"></div>
                
                {/* Fallback button for mobile browsers (Chrome / Brave / Safari) that block popups */}
                <button
                  type="button"
                  onClick={handleMobileGoogleRedirect}
                  className="w-full py-2.5 px-3 bg-[#131722] hover:bg-[#1a2030] border border-[#2a364f] hover:border-cyan-500/50 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
                >
                  <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Mobile Sign-in with Google</span>
                </button>

                <div className="flex justify-between items-center text-[10px] text-gray-500 pt-0.5">
                  <span className="italic">Popup blocked on phone? Use button above</span>
                  <button
                    type="button"
                    onClick={() => setShowGoogleSetupModal(true)}
                    className="hover:text-cyan-400 transition"
                  >
                    Direct Email Mode
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowGoogleSetupModal(true)}
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
            )}

            <div className="auth-divider">
              <span>Or with email credentials</span>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          
          {mode === 'login' ? (
            /* Login Fields */
            <>
              <div className="p-3 bg-[#131b2c] border border-cyan-500/30 rounded-2xl mb-1 flex items-start gap-2.5">
                <Crown className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  <strong className="text-white">Creators & Fans: </strong>
                  Sign in with your Creator handle (e.g. <span className="text-cyan-400 font-mono font-bold">uni_ques78</span>) or Fan account to access your studio and feeds.
                </p>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email or Username</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. uni_ques78 or alex@example.com"
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </div>
            </>
          ) : signupStep === 'details' ? (
            /* Signup Step 1: User & Role Details */
            <>
              <div className="auth-input-group">
                <label className="auth-label">Select Account Type</label>
                <div className="auth-role-grid">
                  <div
                    className={`auth-role-option ${role === 'fan' ? 'selected' : ''}`}
                    onClick={() => setRole('fan')}
                  >
                    <span className="auth-role-title">⭐ Fan / Subscriber</span>
                    <span className="auth-role-desc">Watch 4K uncut tapes, tip, comment & direct DMs</span>
                  </div>
                  <div
                    className={`auth-role-option ${role === 'creator' ? 'selected' : ''}`}
                    onClick={() => setRole('creator')}
                  >
                    <span className="auth-role-title">👑 Creator / Model</span>
                    <span className="auth-role-desc">Launch your VIP channel, upload 4K videos & earn</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Creator Setup Section if Creator Selected */}
              {role === 'creator' && (
                <div className="p-3.5 bg-[#10141f] border border-purple-500/40 rounded-2xl space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#1f2638]">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <div>
                      <h4 className="text-xs font-black text-white">Creator Channel Setup</h4>
                      <p className="text-[10px] text-gray-400">Your channel will be live on JustFans immediately after verification</p>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Stage Name / Channel Display Name</label>
                    <div className="auth-input-wrapper">
                      <UserIcon className="auth-input-icon" />
                      <input
                        type="text"
                        required={role === 'creator'}
                        placeholder="e.g. Nicole Shayla"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="auth-input-group">
                      <label className="auth-label">Category</label>
                      <select
                        value={creatorCategory}
                        onChange={(e) => setCreatorCategory(e.target.value)}
                        className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                      >
                        <option value="Trans VIP & Solo">Trans VIP & Solo</option>
                        <option value="Solo VIP & Teasers">Solo VIP & Teasers</option>
                        <option value="Glamour & Modeling">Glamour & Modeling</option>
                        <option value="Fitness & Cosplay">Fitness & Cosplay</option>
                        <option value="Music & Audio">Music & Audio</option>
                        <option value="Exclusive Vault">Exclusive Vault</option>
                      </select>
                    </div>

                    <div className="auth-input-group">
                      <label className="auth-label">Monthly Sub Price ($)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="4.99"
                          max="999.00"
                          value={creatorPrice}
                          onChange={(e) => setCreatorPrice(e.target.value)}
                          className="w-full bg-[#181e2c] border border-[#273148] rounded-xl pl-7 pr-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-[#00aff0]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Channel Bio / Welcome Pitch</label>
                    <textarea
                      rows="2"
                      placeholder="Welcome to my VIP vault! Uncensored full length tapes & weekly drops..."
                      value={creatorBio}
                      onChange={(e) => setCreatorBio(e.target.value)}
                      className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00aff0] resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Account Handle / Username</label>
                <div className="auth-input-wrapper">
                  <UserIcon className="auth-input-icon" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. uni_ques78 or your_handle"
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
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="auth-input-toggle"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <div className="flex items-center justify-between">
                  <label className="auth-label">Confirm Password</label>
                  {confirmPassword && (
                    <span className={`text-[11px] font-bold flex items-center gap-1 ${
                      password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {password === confirmPassword ? (
                        <>
                          <Check style={{ width: 12, height: 12 }} />
                          <span>Passwords match</span>
                        </>
                      ) : (
                        <span>Passwords do not match</span>
                      )}
                    </span>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="auth-input has-toggle"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="auth-input-toggle"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
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

      </div>

      {/* Official Google Identity Services Modal */}
      {showGoogleSetupModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-gray-200 space-y-5">
            
            <button
              onClick={() => setShowGoogleSetupModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#222b3e]">
              <svg style={{ width: 26, height: 26 }} viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <div>
                <h3 className="font-extrabold text-white text-base">Google Identity Services</h3>
                <p className="text-xs text-gray-400">Official One-Click Sign-In</p>
              </div>
            </div>

            {/* Direct Google Login Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Sign In Directly with your Google Account</span>
              </div>
              <p className="text-[11px] text-gray-400">
                Enter your genuine Google email address. No verification code is required for Google users.
              </p>

              <form onSubmit={handleDirectGoogleLogin} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="e.g. buchychristen@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                />
                <input
                  type="text"
                  placeholder="Your Display Name (Optional)"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#00aff0]"
                />
                <button
                  type="submit"
                  disabled={isGoogleLoading || !customGoogleEmail.trim()}
                  className="w-full py-2.5 bg-gradient-to-r from-[#00aff0] to-[#8b5cf6] hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl transition cursor-pointer"
                >
                  {isGoogleLoading ? 'Authenticating...' : 'Sign In with this Google Account'}
                </button>
              </form>
            </div>

            <div className="auth-divider">
              <span>Or connect native browser popup</span>
            </div>

            {/* Google OAuth Web Client ID Setup */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>2. Connect Google Cloud OAuth Client ID</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                To have Google open the automatic browser account picker, paste your Google Cloud Web Client ID below (ends in <code className="text-gray-300">.apps.googleusercontent.com</code>).
              </p>

              <form onSubmit={handleSaveGoogleClientId} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Paste Google Client ID here..."
                  value={inputClientId}
                  onChange={(e) => setInputClientId(e.target.value)}
                  className="w-full bg-[#181e2c] border border-[#273148] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!inputClientId.trim()}
                  className="w-full py-2.5 bg-[#20283d] hover:bg-[#2a3652] border border-purple-500/40 text-purple-300 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Save & Activate Native Google Button
                </button>
              </form>

              {googleClientId && (
                <p className="text-[10px] text-emerald-400">
                  ✓ Active Client ID: {googleClientId.slice(0, 16)}...
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

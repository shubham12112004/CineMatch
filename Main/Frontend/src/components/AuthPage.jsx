import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Loader, AlertCircle, Clapperboard, X } from 'lucide-react';

// Cinematic poster-palette colours used for the background mosaic
const MOSAIC_COLORS = [
  '#1a0a0a','#0d1117','#0a1628','#12091a','#0f1a0f',
  '#1c0808','#081020','#1a1200','#0a180a','#180818',
  '#200a0a','#0a0a20','#0f0f18','#180f0a','#0a1818',
  '#1a0f0f','#080818','#101818','#180810','#0c1414',
];

const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const buildApiUrl = (path) => (API_URL ? `${API_URL}${path}` : path);

console.log('API URL:', import.meta.env.VITE_API_URL);

export default function AuthPage({ onAuthSuccess, initialError = '', onClose }) {
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = buildApiUrl(isLogin ? '/api/auth/login' : '/api/auth/register');
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      if (!isLogin && formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.token);
    } catch (err) {
      const isApiUrlMissing = !import.meta.env.VITE_API_URL;
      const debugHint = isApiUrlMissing
        ? 'VITE_API_URL is missing. Set it to your Render backend URL in Vercel env vars.'
        : `Request failed for ${buildApiUrl('/api/auth/login')} or ${buildApiUrl('/api/auth/register')}.`;
      setError(`Cannot connect to backend. ${debugHint}`);
      console.error('Auth error:', err);
      setLoading(false);
    }
  };

  // Redirects to the backend Google OAuth route (requires Passport.js setup)
  const handleGoogleSignIn = () => {
    if (!googleAuthEnabled) return;
    window.location.href = buildApiUrl('/api/auth/google');
  };

  const inputClass =
    'w-full bg-[#1c1c1c] border border-white/10 focus:border-red-500/70 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-[#242424] transition-all duration-200';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto"
    >
      {/* Close button */}
      {onClose && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
          title="Close"
        >
          <X size={20} />
        </motion.button>
      )}

    <div
      onClick={(e) => e.stopPropagation()}
      className="relative min-h-screen md:min-h-auto flex items-center justify-center bg-black overflow-hidden">

      {/* ── Cinematic mosaic background ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none select-none"
        style={{ transform: 'scale(1.08) rotate(-2deg)' }}
      >
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(8, 1fr)', height: '115vh' }}>
          {Array.from({ length: 80 }).map((_, i) => (
            <div
              key={i}
              className="rounded"
              style={{ background: MOSAIC_COLORS[i % MOSAIC_COLORS.length] }}
            />
          ))}
        </div>
      </div>

      {/* Layered dark vignette overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

      {/* ── Auth panel ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 mb-8"
        >
          <div className="relative">
            <img
              src="/logo.png"
              alt="CineMatch logo"
              className="h-24 w-24 md:h-28 md:w-28 object-cover rounded-3xl shadow-2xl shadow-black/80 ring-1 ring-white/10"
            />
            <div className="absolute -bottom-2 -right-2 rounded-full bg-red-600 p-2 shadow-lg shadow-red-900/50">
              <Clapperboard className="text-white" size={18} strokeWidth={2.25} />
            </div>
          </div>
          <span className="text-[2.6rem] md:text-[3.2rem] leading-none font-black tracking-[-0.06em] text-white text-center">
            CINE<span className="text-red-500">MATCH</span>
          </span>
        </motion.div>

        {/* Card */}
        <div className="bg-black/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-8 py-8 shadow-2xl shadow-black/80">

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Welcome back. Your cinema awaits.' : 'Start your movie journey today.'}
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -14 : 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 14 : -14 }}
              transition={{ duration: 0.22 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Full Name — sign up only */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 text-gray-500" size={15} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className={inputClass}
                      required={!isLogin}
                      autoComplete="name"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-500" size={15} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                      tabIndex={-1}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-500" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`${inputClass} pr-10`}
                    required
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password — sign up only */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 text-gray-500" size={15} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={inputClass}
                      required={!isLogin}
                      autoComplete="new-password"
                    />
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 text-red-300 text-sm"
                  >
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-lg transition-colors shadow-lg shadow-red-700/30 flex items-center justify-center gap-2 mt-1"
              >
                {loading && <Loader size={15} className="animate-spin" />}
                {loading ? 'Please wait…' : (isLogin ? 'Sign In' : 'Create Account')}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-gray-600 text-xs uppercase tracking-widest font-medium">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {/* Google Sign-In */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                whileHover={googleAuthEnabled ? { scale: 1.01 } : {}}
                whileTap={googleAuthEnabled ? { scale: 0.99 } : {}}
                disabled={!googleAuthEnabled}
                className={`w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 border transition-all ${
                  googleAuthEnabled
                    ? 'bg-white hover:bg-gray-50 text-gray-800 border-transparent shadow-md cursor-pointer'
                    : 'bg-white/[0.04] text-gray-500 border-white/[0.06] cursor-not-allowed'
                }`}
              >
                {/* Google G logo */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill={googleAuthEnabled ? '#4285F4' : '#555'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill={googleAuthEnabled ? '#34A853' : '#555'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill={googleAuthEnabled ? '#FBBC05' : '#555'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill={googleAuthEnabled ? '#EA4335' : '#555'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleAuthEnabled
                  ? `Continue with Google`
                  : (
                    <span className="flex items-center gap-2">
                      Google Sign-In
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    </span>
                  )}
              </motion.button>

            </motion.form>
          </AnimatePresence>

          {/* Switch mode */}
          <p className="text-center text-gray-500 text-sm mt-6">
            {isLogin ? "New to CineMatch? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-white hover:text-red-400 font-semibold transition-colors underline underline-offset-2 decoration-white/20 hover:decoration-red-400/40"
            >
              {isLogin ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Legal footer */}
        <p className="text-center text-gray-700 text-xs mt-5 px-2 leading-relaxed">
          By signing in you agree to our{' '}
          <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Terms of Service</span>
          {' '}and{' '}
          <span className="text-gray-500 hover:text-gray-300 cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
      </motion.div>
    </div>
    </motion.div>
  );
}

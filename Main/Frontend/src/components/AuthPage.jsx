import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Loader, AlertCircle, Clapperboard, X, Sparkles, Heart, Clock3, Brain, ShieldCheck, Github } from 'lucide-react';

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
  const [showForm, setShowForm] = useState(false);
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
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `${buildApiUrl('/api/auth/google')}?redirectTo=${redirectTo}`;
  };

  const inputClass =
    'w-full bg-[#1c1c1c] border border-white/10 focus:border-red-500/70 rounded-lg py-3 pl-10 pr-4 text-white text-sm placeholder-gray-600 focus:outline-none focus:bg-[#242424] transition-all duration-200';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-md overflow-y-auto"
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

      {/* Cinematic animated poster carousel + ambient particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-black/95 opacity-90" />

        {/* floating blurred particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [ -30, 30, -30 ], x: [ -20, 20, -20 ], opacity: [0.06, 0.16, 0.06] }}
            transition={{ duration: 18 + i * 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full blur-3xl bg-gradient-to-r from-purple-600/40 via-pink-500/30 to-blue-400/20"
            style={{ width: 220, height: 220, left: `${5 + i * 12}%`, top: `${10 + (i % 3) * 18}%`, transform: 'translateZ(0)' }}
          />
        ))}

        {/* poster-like floating panels */}
        {['A', 'B', 'C', 'D', 'E'].map((t, idx) => (
          <motion.div
            key={t}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ x: [ -120 + idx * 80, 120 - idx * 60, -120 + idx * 80 ], rotate: [ -6, 6, -6 ], opacity: [0.12, 0.9, 0.12] }}
            transition={{ duration: 26 + idx * 3, repeat: Infinity, ease: 'linear' }}
            className="absolute rounded-2xl overflow-hidden"
            style={{ width: 260, height: 380, left: `${10 + idx * 14}%`, top: '6%', boxShadow: '0 40px 120px rgba(0,0,0,0.7)' }}
          >
            <div className="w-full h-full" style={{ background: `linear-gradient(180deg, rgba(20,20,30,0.9), rgba(10,10,10,0.9)), linear-gradient(180deg, rgba(255,255,255,0.02), transparent), linear-gradient(90deg, rgba(255,255,255,0.02), transparent)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start', padding: 18 }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 22, letterSpacing: '0.02em' }}>{`Cinematic ${t}`}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Layered dark vignette overlays */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/85 to-black" />

      {/* ── Auth panel / cinematic card ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[980px] mx-4 px-6"
      >
        <div className="flex items-center justify-center mb-6">
          <img src="/logo.png" alt="CineMatch" className="h-16 w-16 rounded-2xl shadow-xl" />
        </div>

        <div className="mx-auto rounded-3xl p-[1px]" style={{ background: 'linear-gradient(90deg, rgba(255,0,80,0.08), rgba(120,60,255,0.06))' }}>
          <div className="bg-black/70 backdrop-blur-2xl rounded-3xl px-10 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 120px 200px rgba(0,0,0,0.35)' }} />

            {/* Top copy and benefits */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3 justify-center">
                <div className="rounded-full bg-white/6 p-2 text-white/90 shadow-sm"><ShieldCheck size={18} /></div>
                <div className="text-xs uppercase tracking-widest text-gray-300 font-semibold">Premium</div>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-white text-center leading-tight">Unlock Your Personalized Movie Universe</h1>
              <p className="mt-3 text-center text-gray-300 max-w-2xl mx-auto">Get AI-powered movie recommendations, smart watchlists, continue watching, and personalized discovery tailored to your taste.</p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <div className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                  <div className="bg-white/6 rounded-lg p-2"><Sparkles size={18} /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">AI Recommendations</div>
                    <div className="text-xs text-gray-300">Taste-driven matches</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                  <div className="bg-white/6 rounded-lg p-2"><Heart size={18} /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">Save Watchlists</div>
                    <div className="text-xs text-gray-300">Across devices</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                  <div className="bg-white/6 rounded-lg p-2"><Clock3 size={18} /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">Continue Watching</div>
                    <div className="text-xs text-gray-300">Pick up where you left off</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-white/3 rounded-xl p-3">
                  <div className="bg-white/6 rounded-lg p-2"><Brain size={18} /></div>
                  <div>
                    <div className="text-sm font-semibold text-white">Smart Finder</div>
                    <div className="text-xs text-gray-300">Conversational discovery</div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              {!showForm ? (
                <div className="mt-6 grid gap-3">
                  <motion.button
                    type="button"
                    onClick={handleGoogleSignIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 bg-white text-gray-900 shadow-lg"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => { setShowForm(true); setIsLogin(true); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white shadow-inner"
                  >
                    <Mail size={16} />
                    Continue with Email
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => { const gh = import.meta.env.VITE_GITHUB_AUTH_ENABLED === 'true'; if (gh) { window.location.href = buildApiUrl('/api/auth/github'); } }}
                    className="w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 bg-black/40 text-gray-200 border border-white/6"
                  >
                    <Github size={16} />
                    Continue with GitHub
                  </motion.button>

                  <div className="pt-2 text-center">
                    <button type="button" onClick={() => { if (onClose) onClose(); }} className="text-sm text-gray-300 hover:text-white transition-colors">Continue browsing as guest</button>
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.form
                    key={isLogin ? 'login' : 'signup'}
                    initial={{ opacity: 0, x: isLogin ? -14 : 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isLogin ? 14 : -14 }}
                    transition={{ duration: 0.22 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 mt-6"
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

                    {/* Google sign-in (in-form) */}
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignIn}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-3 border transition-all ${googleAuthEnabled ? 'bg-white hover:bg-gray-50 text-gray-800 border-transparent shadow-md' : 'bg-white/[0.04] text-gray-400 border-white/[0.06]'}`}
                      aria-disabled={!googleAuthEnabled}
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill={googleAuthEnabled ? '#4285F4' : '#555'} d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill={googleAuthEnabled ? '#34A853' : '#555'} d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill={googleAuthEnabled ? '#FBBC05' : '#555'} d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill={googleAuthEnabled ? '#EA4335' : '#555'} d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </motion.button>

                    {/* Switch mode inside form */}
                    <p className="text-center text-gray-500 text-sm mt-4">
                      {isLogin ? "New to CineMatch? " : 'Already have an account? '}
                      <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-white hover:text-red-400 font-semibold transition-colors underline underline-offset-2 decoration-white/20 hover:decoration-red-400/40"
                      >
                        {isLogin ? 'Create an account' : 'Sign in'}
                      </button>
                    </p>

                  </motion.form>
                </AnimatePresence>
              )}
            </div>

          
        </div>
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

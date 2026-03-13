import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Loader, Sparkles } from 'lucide-react';

export default function AuthPage({ onAuthSuccess }) {
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

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
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
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
        body: JSON.stringify(payload)
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
      setError('Cannot connect to backend. Start the CineMatch server and try again.');
      console.error('Auth error:', err);
      setLoading(false);
    }
  };

  // Google OAuth Sign In Handler
  // Note: Requires backend setup with Google OAuth 2.0 credentials
  const handleGoogleSignIn = () => {
    if (!googleAuthEnabled) return;
    // TODO: Implement Google OAuth flow
    // 1. Install: npm install passport passport-google-oauth20
    // 2. Setup Google Cloud Console credentials
    // 3. Add OAuth routes in server.js
    // 4. Configure callback URL
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center px-4 py-6 md:py-8">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-red-900 to-orange-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -30, 0],
            x: [0, 20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            y: [0, 30, 0],
            x: [0, -20, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="bg-black/40 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl">
          {/* Logo with Icon */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-center mb-8 space-y-3"
          >
            <motion.img
              src="/logo.png"
              alt="CineMatch logo"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mx-auto h-20 w-20 rounded-3xl object-cover shadow-xl shadow-black/40"
            />
            <h1 className="text-5xl font-black bg-linear-to-r from-red-500 via-pink-500 to-orange-500 bg-clip-text text-transparent tracking-tighter">
              CINEMATCH
            </h1>
            <p className="text-gray-300 text-sm font-semibold">Your Personal Movie Universe</p>
          </motion.div>

          {/* Tab Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex gap-2 bg-white/5 rounded-2xl p-1.5 mb-8 border border-white/10"
          >
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                isLogin 
                  ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                !isLogin 
                  ? 'bg-linear-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-600/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Sign Up
            </button>
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Name Field - Only for Sign Up */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <label className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-3.5 text-pink-400 group-focus-within:text-pink-300 transition-colors" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-white/10 focus:shadow-lg focus:shadow-pink-500/20 transition-all"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-blue-400 group-focus-within:text-blue-300 transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:bg-white/10 focus:shadow-lg focus:shadow-blue-500/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-purple-400 group-focus-within:text-purple-300 transition-colors" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:bg-white/10 focus:shadow-lg focus:shadow-purple-500/20 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password - Only for Sign Up */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <label className="block text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-orange-400 group-focus-within:text-orange-300 transition-colors" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:bg-white/10 focus:shadow-lg focus:shadow-orange-500/20 transition-all"
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-4 text-red-200 text-sm font-semibold flex items-start gap-3"
                  >
                    <Sparkles size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-linear-to-r from-red-600 via-pink-600 to-orange-600 hover:from-red-500 hover:via-pink-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/40 text-gray-400 font-semibold uppercase tracking-wider">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              {!googleAuthEnabled && (
                <div className="bg-amber-500/15 border border-amber-400/40 rounded-xl px-4 py-3 text-amber-200 text-xs font-semibold">
                  Google sign-in is currently unavailable. Use email/password sign-in.
                </div>
              )}

              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!googleAuthEnabled}
                className={`w-full py-4 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 border ${
                  googleAuthEnabled
                    ? 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300'
                    : 'bg-gray-300/20 text-gray-400 border-gray-600 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleAuthEnabled ? `Sign ${isLogin ? 'in' : 'up'} with Google` : 'Google sign-in unavailable'}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center text-gray-400 text-sm font-medium mt-6"
          >
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-transparent bg-linear-to-r from-red-400 to-pink-400 bg-clip-text font-bold hover:from-red-300 hover:to-pink-300 transition-all"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </motion.p>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center space-y-2"
        >
          <p className="text-white/60 text-xs font-medium flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-yellow-400" />
            Free forever. No credit card required.
          </p>
          <p className="text-white/40 text-xs">
            💡 Ensure MongoDB is running at mongodb://localhost:27017
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

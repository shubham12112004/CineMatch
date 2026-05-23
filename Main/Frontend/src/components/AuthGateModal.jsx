import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Lock, Sparkles, UserRound, ShieldCheck, PlayCircle } from 'lucide-react';

export default function AuthGateModal({ feature, copy, onLogin, onClose, onBrowse }) {
  const benefits = [
    'Save watchlists and favorites across devices',
    'Unlock AI recommendations and Smart Finder',
    'Keep your personalized discovery history',
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/82 px-4 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-linear-to-br from-[#12131a]/96 via-[#0b0c12]/96 to-black/96 shadow-[0_30px_90px_rgba(0,0,0,0.72)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_36%)]" />
          <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-cyan-400/10" />

          <div className="relative z-10 grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
            <div className="relative overflow-hidden p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                  <Lock size={12} /> Premium feature
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-red-500/30 to-amber-400/20 text-white shadow-[0_0_24px_rgba(239,68,68,0.22)]">
                  <Sparkles size={22} />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40">Unlock access</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">{copy?.title || 'Unlock premium discovery'}</h2>
                </div>
              </div>

              <p className="max-w-lg text-sm leading-6 text-white/65 md:text-base">
                {copy?.message || 'Sign in to unlock personalized discovery, AI-powered recommendations, and premium OTT-style features.'}
              </p>

              <div className="mt-6 space-y-3">
                {benefits.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                    <ShieldCheck size={16} className="mt-0.5 text-emerald-300" />
                    <p className="text-sm text-white/72">{item}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
                >
                  Sign in now
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={onBrowse}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  <PlayCircle size={16} />
                  Keep browsing
                </button>
              </div>
            </div>

            <div className="border-t border-white/8 bg-black/20 p-6 md:border-l md:border-t-0 md:p-8">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/4 p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Personalized access</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">Why sign in?</h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-sm font-semibold text-white">AI-powered recommendations</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">Get suggestions that feel closer to a streaming service than a search form.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-sm font-semibold text-white">Saved everywhere</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">Watchlists, preferences, and history stay in sync across devices.</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                    <p className="text-sm font-semibold text-white">Google or email</p>
                    <p className="mt-1 text-sm leading-6 text-white/55">A smooth, low-friction onboarding flow with animated transitions.</p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {copy?.cta || 'Sign in to unlock personalized movie discovery.'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

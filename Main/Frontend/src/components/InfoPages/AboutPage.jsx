import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import { Sparkles, Zap, Users, Target } from 'lucide-react';

export default function AboutPage({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[90vh] bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <h1 className="brand-font text-3xl tracking-wide text-red-500">About CineMatch</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 text-gray-300">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
            <p className="leading-relaxed text-sm">
              Founded in Bangalore, India in 2026, CineMatch emerged from a simple frustration: spending 30 minutes scrolling streaming apps with nothing to watch. Our founding team—passionate filmmakers, AI engineers, and product designers—decided to build a smarter solution. Today, we serve 2M+ users across 50+ countries, helping them discover from 500K+ movies and series.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Mission</h2>
            <p className="leading-relaxed text-sm">
              Democratize entertainment discovery worldwide. By combining advanced AI with community intelligence, we remove friction from finding your next favorite film. At CineMatch, great entertainment shouldn't be hidden—it should be intuitive, personal, and fun.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Why CineMatch?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: 'AI-Powered Intelligence',
                  desc: 'Google Gemini recommendations that learn your taste'
                },
                {
                  icon: Zap,
                  title: 'Lightning Fast Search',
                  desc: 'Instant search and comparison across 500K+ titles'
                },
                {
                  icon: Users,
                  title: '2M+ Global Community',
                  desc: 'Real ratings, reviews, and insights from viewers'
                },
                {
                  icon: Target,
                  title: 'Mood-Based Discovery',
                  desc: 'Find exactly what you want to watch right now'
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white/5 border border-white/10 p-4 rounded-xl">
                    <Icon size={24} className="text-red-500 mb-2" />
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Built With Modern Tech</h2>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
              <p className="text-sm"><span className="text-red-400 font-bold">Frontend:</span> React 19 + Vite + Tailwind CSS</p>
              <p className="text-sm"><span className="text-red-400 font-bold">Backend:</span> Node.js + Express + MongoDB</p>
              <p className="text-sm"><span className="text-red-400 font-bold">Data:</span> TMDB API (500K+ titles)</p>
              <p className="text-sm"><span className="text-red-400 font-bold">AI:</span> Google Gemini for personalized insights</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Key Achievements</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-red-400 font-bold min-w-fit">Q1 2026</span>
                <p className="text-sm">Launched with 500K+ titles from TMDB</p>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold min-w-fit">Q2 2026</span>
                <p className="text-sm">Reached 2M+ users, AI Chat & Smart Finder live</p>
              </div>
              <div className="flex gap-3">
                <span className="text-red-400 font-bold min-w-fit">Today</span>
                <p className="text-sm">Serving 50+ countries with Compare & Watchlist features</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Team</h2>
            <p className="text-sm leading-relaxed mb-4">
              Founded by passionate filmmakers, AI engineers, and product designers in Bangalore. Remote-first, always hiring.
            </p>
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
              <p className="text-xs text-gray-400">📍 HQ: 12, MG Road, Bangalore 560001, India<br/>🌐 Global team | 🚀 Mission-driven | 💼 Hiring</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

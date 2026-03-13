import React from 'react';
import { motion } from 'motion/react';

export default function NavButton({ children, onClick, icon: Icon, active = false, variant = 'default', colorTheme = 'gray' }) {
  const themeMap = {
    gray: {
      base: 'bg-slate-800/60 border-slate-600/40 text-slate-200 hover:border-slate-500/80 hover:bg-slate-700/70',
      glow: 'from-slate-500 via-slate-400 to-slate-300',
      icon: 'text-slate-200'
    },
    red: {
      base: 'bg-red-900/35 border-red-500/50 text-red-200 hover:border-red-400/80 hover:bg-red-800/45',
      glow: 'from-red-500 via-rose-500 to-orange-400',
      icon: 'text-red-300'
    },
    emerald: {
      base: 'bg-emerald-900/35 border-emerald-500/50 text-emerald-200 hover:border-emerald-400/80 hover:bg-emerald-800/45',
      glow: 'from-emerald-500 via-teal-500 to-cyan-400',
      icon: 'text-emerald-300'
    },
    violet: {
      base: 'bg-violet-900/35 border-violet-500/50 text-violet-200 hover:border-violet-400/80 hover:bg-violet-800/45',
      glow: 'from-violet-500 via-fuchsia-500 to-pink-400',
      icon: 'text-violet-300'
    },
    amber: {
      base: 'bg-amber-900/35 border-amber-500/50 text-amber-200 hover:border-amber-400/80 hover:bg-amber-800/45',
      glow: 'from-amber-500 via-orange-500 to-yellow-400',
      icon: 'text-amber-300'
    },
    cyan: {
      base: 'bg-cyan-900/35 border-cyan-500/50 text-cyan-200 hover:border-cyan-400/80 hover:bg-cyan-800/45',
      glow: 'from-cyan-500 via-sky-500 to-blue-400',
      icon: 'text-cyan-300'
    }
  };

  const theme = themeMap[colorTheme] || themeMap.gray;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative h-10 px-3.5 rounded-xl text-[13px] font-semibold tracking-normal
        inline-flex items-center justify-center gap-1.5 whitespace-nowrap
        transition-all duration-300 overflow-hidden group
        border backdrop-blur-sm shadow-lg
        ${active ? 'ring-2 ring-white/30' : ''}
        ${variant === 'highlight' ? 'bg-red-600/20 text-red-100 border-red-400/70 hover:bg-red-600/35' : theme.base}
      `}
    >
      {/* Animated gradient border on hover */}
      <span className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-r ${theme.glow} blur-sm -z-10`} />
      <span className="absolute inset-px rounded-lg bg-black/35 z-0" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-1.5">
        {Icon && <Icon size={14} className={variant === 'highlight' ? 'text-red-200' : theme.icon} />}
        <span className="hidden md:inline truncate">{children}</span>
      </span>
    </motion.button>
  );
}

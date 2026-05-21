import React from 'react';
import { motion } from 'motion/react';

const SkeletonCard = () => (
  <div className="shrink-0 w-44 md:w-56 lg:w-64">
    <div className="aspect-[2/3] overflow-hidden rounded-[1.35rem] border border-white/8 bg-white/[0.03] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <motion.div
        animate={{ opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative h-full w-full overflow-hidden bg-linear-to-b from-slate-900 via-slate-800 to-slate-900"
      >
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-4 space-y-3">
          <div className="h-3 w-4/5 rounded-full bg-white/10" />
          <div className="h-3 w-2/5 rounded-full bg-white/8" />
          <div className="flex gap-2 pt-1">
            <div className="h-5 w-16 rounded-full bg-white/8" />
            <div className="h-5 w-12 rounded-full bg-white/8" />
          </div>
        </div>
      </motion.div>
    </div>
  </div>
);

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="flex gap-4 overflow-hidden py-2">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

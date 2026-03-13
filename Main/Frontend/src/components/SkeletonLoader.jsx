import React from 'react';
import { motion } from 'motion/react';

const SkeletonCard = () => {
  return (
    <div className="shrink-0 w-40 md:w-60 h-60 md:h-90">
      <motion.div
        animate={{
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-md relative overflow-hidden"
      >
        {/* Shimmer effect */}
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
      </motion.div>
    </div>
  );
};

export default function SkeletonLoader({ count = 6 }) {
  return (
    <div className="flex gap-4 overflow-hidden px-4 md:px-12 py-4">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

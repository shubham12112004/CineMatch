import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AgeVerification({ onConfirm, onDismiss }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-200 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-linear-to-br from-[#1a1a1a] to-[#0f0f0f] border border-red-600/30 rounded-2xl p-8 max-w-md shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>

          {/* Warning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-600/20 border border-red-600/40 rounded-full flex items-center justify-center">
              <AlertCircle size={32} className="text-red-600" />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
              Age Verification
            </h2>
            
            <p className="text-gray-300 leading-relaxed">
              CineMatch may contain movies and series with various themes. You can enable <span className="text-emerald-400 font-bold">Family Safe Mode</span> in settings to filter romance and adult content.
            </p>

            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4">
              <p className="text-sm font-bold text-red-400 uppercase tracking-widest">
                Are you 18 years or older?
              </p>
            </div>

            <p className="text-xs text-gray-500">
              Enable Family Safe Mode in Account Settings to automatically filter adult-themed content from all searches and recommendations.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDismiss}
              className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold uppercase tracking-widest rounded-lg transition-colors"
            >
              I'm Under 18
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(true)}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter rounded-lg transition-colors shadow-lg shadow-red-600/20"
            >
              I'm 18+
            </motion.button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-600 text-center mt-6">
            This is for content rating purposes only. Always follow local laws and regulations.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

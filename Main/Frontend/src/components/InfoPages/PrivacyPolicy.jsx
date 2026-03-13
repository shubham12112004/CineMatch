import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

export default function PrivacyPolicy({ onClose }) {
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
          <h1 className="brand-font text-3xl tracking-wide text-red-500">Privacy Policy</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-white mb-3">Last Updated: March 12, 2026</h2>
            <p>
              This Privacy Policy explains how CineMatch Inc. (Bangalore, India) collects, uses, and safeguards your information when you use our service at cinematch.io and our mobile applications.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">1. Information We Collect</h3>
            <p>We collect information you provide directly, such as:</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>Account information (name, email, password, profile picture)</li>
              <li>Watchlist, ratings, and favorites</li>
              <li>Search queries, viewing history, and preferences</li>
              <li>Device information (IP address, browser type, OS)</li>
              <li>Cookies for analytics and personalization</li>
              <li>Payment information via secure third-party processors</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">2. How We Use Your Information</h3>
            <p>Your information is used to:</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>Provide and maintain our service</li>
              <li>Personalize recommendations and experience</li>
              <li>Authenticate accounts and prevent fraud</li>
              <li>Send service updates and security alerts</li>
              <li>Improve our platform through analytics</li>
              <li>Comply with legal requirements</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">3. Data Security & Retention</h3>
            <p>
              We use SSL/TLS encryption, bcrypt password hashing, and regular security audits. Data is retained as long as your account is active. You can request deletion at privacy@cinematch.io. No data is sold to third parties.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">4. Third-Party Services</h3>
            <p>
              CineMatch uses The Movie Database (TMDB) for content data and Google Gemini for AI recommendations. These services are governed by their own privacy policies.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">5. Your Rights (GDPR/CCPA)</h3>
            <p>
              If you're in the EU, you have rights to access, correct, delete, or port your data. Opt-out of marketing and tracking anytime. Contact privacy@cinematch.io to exercise your rights.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">6. Contact Us</h3>
            <p>
              Privacy concerns: privacy@cinematch.io<br />General inquiries: support@cinematch.io<br />Office: 12, MG Road, Bangalore 560001, India
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

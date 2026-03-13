import React from 'react';
import { X } from 'lucide-react';
import { motion } from 'motion/react';

export default function TermsOfService({ onClose }) {
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
          <h1 className="brand-font text-3xl tracking-wide text-red-500">Terms of Service</h1>
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
              These Terms of Service ("Terms") govern your use of CineMatch and constitute a legal agreement between you and CineMatch Inc., Bangalore, India.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">1. Acceptance & Age Requirement</h3>
            <p>
              By accessing CineMatch, you represent that you are at least 13 years old. Parents or guardians must supervise minor users. We reserve the right to verify age compliance.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">2. User Conduct & Restrictions</h3>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
              <li>Use CineMatch for illegal, fraudulent, or harmful purposes</li>
              <li>Harass, threaten, or defame other users</li>
              <li>Infringe copyrights, trademarks, or intellectual property</li>
              <li>Attempt to hack, reverse-engineer, or compromise security</li>
              <li>Post explicit, abusive, or hate speech content</li>
              <li>Scrape or extract data without authorization</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">3. Intellectual Property Rights</h3>
            <p>
              CineMatch, all content, features, and software are property of CineMatch Inc. and its licensors. Movie data is licensed from TMDB. You may not reproduce, distribute, or modify content without permission.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">4. Account & Content Responsibility</h3>
            <p>
              You are responsible for account security. User-generated content (ratings, reviews) must be original or properly licensed. CineMatch reserves the right to remove violating content. User content may improve recommendations (anonymously).
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">5. Disclaimer & Limitation of Liability</h3>
            <p>
              CineMatch is provided "AS IS" without warranties. We don't guarantee accuracy or recommendation algorithms. CineMatch is not liable for indirect, incidental, or consequential damages.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">6. Termination</h3>
            <p>
              We may suspend your account for violating these terms, fraud, or illegal activity. You can delete your account at any time via Settings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">7. Changes to Terms</h3>
            <p>
              We may modify these terms anytime. Continued use means acceptance of updated terms. Major changes are announced in-app.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-2">6. Contact Us</h3>
            <p>
              For any questions regarding these Terms, please contact us at legal@cinematch.io
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

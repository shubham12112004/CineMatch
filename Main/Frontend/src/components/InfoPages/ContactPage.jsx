import React, { useState } from 'react';
import { X, Mail, MessageSquare, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactPage({ onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send to backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

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
        className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#141414]">
          <h1 className="brand-font text-3xl tracking-wide text-red-500">Contact Us</h1>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <Mail className="text-red-500 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="text-white font-bold mb-1">General Support</h3>
                  <a href="mailto:support@cinematch.io" className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                    support@cinematch.io
                  </a>
                  <p className="text-xs text-gray-500 mt-1">7 days/week • 24-hour response</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MessageSquare className="text-red-500 mt-1 shrink-0" size={20} />
                <div>
                  <h3 className="text-white font-bold mb-1">Urgent Issues</h3>
                  <a href="mailto:help@cinematch.io" className="text-gray-400 hover:text-red-400 text-sm transition-colors">
                    help@cinematch.io
                  </a>
                  <p className="text-xs text-gray-500 mt-1\">Priority response within 4 hours</p>
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
                <h4 className="text-white font-bold text-sm mb-2">Office Location</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  CineMatch Inc.<br/>
                  12, MG Road<br/>
                  Bangalore 560001<br/>
                  Karnataka, India<br/>
                  <a href="tel:+918067418425" className="text-red-400 hover:text-red-300 transition-colors\">+91-80674-18425</a>
                </p>
              </div>
            </div>

            {/* Quick Links & Social */}
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-bold mb-3">Support Channels</h3>
                <div className="space-y-2">
                  <a href="mailto:bugs@cinematch.io" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    → Report a Bug (bugs@cinematch.io)
                  </a>
                  <a href="mailto:features@cinematch.io" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    → Request a Feature
                  </a>
                  <a href="mailto:business@cinematch.io" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    → Partnerships & Advertising
                  </a>
                  <a href="mailto:press@cinematch.io" className="block text-gray-400 hover:text-white text-sm transition-colors">
                    → Press & Media Kit
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-3">Follow Us</h3>
                <div className="flex gap-3">
                  <a href="https://twitter.com/cinematchio" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                    → Twitter/X
                  </a>
                  <a href="https://instagram.com/cinematchio" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors text-sm">
                    → Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">⏱️ <span className="font-bold text-white">Response Times:</span> General emails within 24h • Urgent support within 4h • Bug reports reviewed daily</p>
          </div>

          {/* Contact Form */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-600/20 border border-green-600/50 p-6 rounded-xl text-center"
            >
              <p className="text-green-300 font-bold mb-2">✓ Message Received!</p>
              <p className="text-sm text-gray-400">
                Thanks for reaching out. We'll be in touch soon!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/10 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50"
              />
              <textarea
                name="message"
                placeholder="Your message..."
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 resize-none"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Send size={18} />
                Send Message
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

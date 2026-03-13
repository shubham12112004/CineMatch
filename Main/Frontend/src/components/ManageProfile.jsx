import React, { useState } from 'react';
import { X, User, Mail, Edit2, Save } from 'lucide-react';
import { motion } from 'motion/react';

export default function ManageProfile({ onClose, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || 'User',
    email: currentUser?.email || 'user@cinematch.com',
    phone: currentUser?.phone || '+1-XXX-XXX-XXXX',
    bio: currentUser?.bio || 'Movie enthusiast and streaming lover',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
    // TODO: Send update to backend
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col p-4 md:p-12 overflow-y-auto custom-scrollbar"
    >
      <div className="flex justify-between items-center mb-12 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <User size={32} className="text-red-600" />
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Manage Profile</h1>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X size={32} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Profile Picture and Basic Info */}
        <div className="bg-linear-to-br from-red-600/10 to-purple-600/10 border border-red-600/20 rounded-3xl p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-linear-to-br from-red-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-black shadow-2xl shrink-0">
              {formData.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Basic Info */}
            <div className="flex-1 w-full space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="Your name"
                  />
                ) : (
                  <p className="text-white text-xl font-bold">{formData.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="your.email@example.com"
                  />
                ) : (
                  <p className="text-gray-300 font-semibold">{formData.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                    placeholder="+1-XXX-XXX-XXXX"
                  />
                ) : (
                  <p className="text-gray-300 font-semibold">{formData.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-4">
          <label className="block text-gray-400 font-bold text-xs uppercase tracking-widest">Bio</label>
          {isEditing ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-gray-300 font-semibold italic">{formData.bio}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg"
            >
              <Edit2 size={20} />
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="px-8 py-4 bg-green-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Save size={20} />
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-8 py-4 bg-gray-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Account Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400 font-semibold">Account Status</span>
              <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full font-bold text-xs uppercase tracking-widest">Active</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400 font-semibold">Membership Type</span>
              <span className="text-white font-bold">Premium</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-gray-400 font-semibold">Member Since</span>
              <span className="text-white font-bold">January 2024</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-semibold">Last Login</span>
              <span className="text-white font-bold">Today at 2:30 PM</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-600/10 border border-red-600/20 rounded-3xl p-8 space-y-4">
          <h2 className="text-xl font-black text-red-600 uppercase tracking-tighter">Danger Zone</h2>
          <p className="text-gray-400 text-sm">These actions cannot be undone.</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="px-6 py-3 bg-red-600/20 text-red-500 border border-red-600/50 rounded-lg font-bold uppercase tracking-widest hover:bg-red-600/30 transition-all">
              Change Password
            </button>
            <button className="px-6 py-3 bg-red-600/20 text-red-500 border border-red-600/50 rounded-lg font-bold uppercase tracking-widest hover:bg-red-600/30 transition-all">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

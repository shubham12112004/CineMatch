import React from 'react';
import { motion } from 'motion/react';
import { User, List, Settings, Palette, Shield, MessageSquare, LogOut } from 'lucide-react';

export default function ProfileDropdown({ user, onClose, onLogout, onOpenManageProfile, onOpenMyList, onOpenPreferences, onOpenTheme, onOpenAccount, onOpenChat }) {
  const handleManageProfile = () => {
    if (typeof onOpenManageProfile === 'function') onOpenManageProfile();
    setTimeout(() => onClose(), 100);
  };

  const handleMyList = () => {
    if (typeof onOpenMyList === 'function') onOpenMyList();
    setTimeout(() => onClose(), 100);
  };

  const handleAIChat = () => {
    if (typeof onOpenChat === 'function') onOpenChat();
    setTimeout(() => onClose(), 100);
  };

  const handlePreferences = () => {
    if (typeof onOpenPreferences === 'function') onOpenPreferences();
    setTimeout(() => onClose(), 100);
  };

  const handleThemeSettings = () => {
    if (typeof onOpenTheme === 'function') onOpenTheme();
    setTimeout(() => onClose(), 100);
  };

  const handleAccountSettings = () => {
    if (typeof onOpenAccount === 'function') onOpenAccount();
    setTimeout(() => onClose(), 100);
  };

  const handleLogoutClick = () => {
    if (typeof onLogout === 'function') onLogout();
    setTimeout(() => onClose(), 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] rounded-lg border border-white/10 shadow-2xl overflow-hidden z-50 pointer-events-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-white/10 bg-linear-to-br from-red-600/10 to-purple-600/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400">{user?.email || 'user@cinematch.com'}</p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <button
          type="button"
          onClick={handleManageProfile}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <User size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">Manage Profile</span>
        </button>
        <button
          type="button"
          onClick={handleMyList}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <List size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">My List</span>
        </button>
        <button
          type="button"
          onClick={handleAIChat}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <MessageSquare size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">AI Chat</span>
        </button>
        <button
          type="button"
          onClick={handlePreferences}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <Settings size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">Preferences</span>
        </button>
        <button
          type="button"
          onClick={handleThemeSettings}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <Palette size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">Theme Settings</span>
        </button>
        <button
          type="button"
          onClick={handleAccountSettings}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left cursor-pointer"
        >
          <Shield size={18} className="text-gray-400" />
          <span className="text-sm text-gray-300">Account Settings</span>
        </button>
      </div>

      <div className="border-t border-white/10 p-2">
        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-red-600/20 text-red-500 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>
    </motion.div>
  );
}

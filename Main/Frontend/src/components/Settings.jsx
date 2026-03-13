import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, SlidersHorizontal, Palette, Shield, Sparkles, Save, Clipboard, CheckCircle2 } from 'lucide-react';

const TAB_ITEMS = [
  { key: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { key: 'theme', label: 'Theme', icon: Palette },
  { key: 'account', label: 'Account', icon: Shield },
];

const GENRE_OPTIONS = [
  'Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Sci-Fi', 'Crime', 'Family'
];

export default function Settings({
  onClose,
  initialTab = 'preferences',
  onTabChange,
  themeMode = 'default',
  onThemeModeChange,
  backgroundFx = 'none',
  onBackgroundFxChange,
  familySafeMode = false,
  onFamilySafeModeChange,
  currentUser,
  onRunPreferenceSearch,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState(() => {
    const savedPrefs = localStorage.getItem('cineMatch_userPreferences');
    return savedPrefs
      ? JSON.parse(savedPrefs)
      : {
          favoriteActors: '',
          preferredGenres: ['Drama', 'Thriller'],
          quickSearchNotes: '',
          watchMood: 'Story Rich',
        };
  });

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const updateTab = (tab) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handlePrefSave = () => {
    localStorage.setItem('cineMatch_userPreferences', JSON.stringify(prefs));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleRunPreferenceSearch = () => {
    localStorage.setItem('cineMatch_userPreferences', JSON.stringify(prefs));
    if (onRunPreferenceSearch) {
      onRunPreferenceSearch(prefs);
    }
  };

  const handleCopyQuickNotes = async () => {
    if (!prefs.quickSearchNotes.trim()) return;
    await navigator.clipboard.writeText(prefs.quickSearchNotes);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const toggleGenre = (genre) => {
    setPrefs((prev) => ({
      ...prev,
      preferredGenres: prev.preferredGenres.includes(genre)
        ? prev.preferredGenres.filter((item) => item !== genre)
        : [...prev.preferredGenres, genre],
    }));
  };

  const userInitial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/90 backdrop-blur-xl p-4 md:p-8 overflow-y-auto custom-scrollbar"
    >
      <div className="max-w-5xl mx-auto">
        <div className="bg-linear-to-br from-white/10 to-white/5 border border-white/15 rounded-3xl p-5 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">SETTINGS STUDIO</h1>
              <p className="text-gray-400 text-sm mt-1">Customize your experience with saved preferences and themes.</p>
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center"
            >
              <X size={22} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {TAB_ITEMS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => updateTab(tab.key)}
                  className={`group flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-linear-to-r from-red-600/90 to-pink-600/90 border-red-400/80 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={18} className={`transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-bold tracking-wide text-sm uppercase">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <label className="block text-xs font-black tracking-widest text-gray-300 mb-2 uppercase">Favorite Actors (comma separated)</label>
                <textarea
                  value={prefs.favoriteActors}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, favoriteActors: e.target.value }))}
                  placeholder="Shah Rukh Khan, Leonardo DiCaprio, Vijay Sethupathi..."
                  className="w-full min-h-24 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black tracking-widest text-gray-300 mb-3 uppercase">Preferred Genres</p>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => {
                    const selected = prefs.preferredGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-2 rounded-full text-xs font-bold tracking-wide border transition-all ${
                          selected
                            ? 'bg-red-600/85 border-red-400 text-white'
                            : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <label className="block text-xs font-black tracking-widest text-gray-300 mb-2 uppercase">Quick Search Notes (save + copy later)</label>
                <textarea
                  value={prefs.quickSearchNotes}
                  onChange={(e) => setPrefs((prev) => ({ ...prev, quickSearchNotes: e.target.value }))}
                  placeholder="Copy actor names, movie titles, watch ideas here. Use this later in search and add to your list quickly."
                  className="w-full min-h-28 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500"
                />
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    type="button"
                    onClick={handlePrefSave}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition-all text-sm font-bold flex items-center gap-2"
                  >
                    <Save size={16} /> Save Preferences
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyQuickNotes}
                    className="px-4 py-2 rounded-lg bg-cyan-700/70 hover:bg-cyan-600/70 transition-all text-sm font-bold flex items-center gap-2"
                  >
                    <Clipboard size={16} /> Copy Notes
                  </button>
                  <button
                    type="button"
                    onClick={handleRunPreferenceSearch}
                    className="px-4 py-2 rounded-lg bg-emerald-700/75 hover:bg-emerald-600/80 transition-all text-sm font-bold flex items-center gap-2"
                  >
                    <Sparkles size={16} /> Find Movies From Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'theme' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black tracking-widest text-gray-300 mb-3 uppercase">Main Page Color Theme</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'default', label: 'Classic Dark', preview: 'from-gray-900 to-gray-800' },
                    { key: 'ocean', label: 'Ocean Neon', preview: 'from-blue-950 to-cyan-900' },
                    { key: 'sunset', label: 'Sunset Glow', preview: 'from-rose-950 to-amber-900' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => onThemeModeChange && onThemeModeChange(item.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themeMode === item.key
                          ? 'border-red-400 bg-red-600/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className={`h-10 rounded-lg bg-linear-to-r ${item.preview} mb-2`} />
                      <p className="text-sm font-bold">{item.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black tracking-widest text-gray-300 mb-3 uppercase">Background Animation</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'none', label: 'None' },
                    { key: 'aurora', label: 'Aurora' },
                    { key: 'particles', label: 'Particles' },
                    { key: 'pulse', label: 'Pulse Glow' },
                  ].map((fx) => (
                    <button
                      key={fx.key}
                      type="button"
                      onClick={() => onBackgroundFxChange && onBackgroundFxChange(fx.key)}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all ${
                        backgroundFx === fx.key
                          ? 'bg-fuchsia-600/30 border-fuchsia-400 text-white'
                          : 'bg-white/5 border-white/15 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {fx.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center font-black text-2xl">
                  {userInitial}
                </div>
                <div>
                  <h3 className="text-xl font-black">{currentUser?.name || 'CineMatch User'}</h3>
                  <p className="text-gray-400 text-sm">{currentUser?.email || 'user@cinematch.com'}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <p className="text-xs font-black tracking-widest text-gray-300 mb-3 uppercase">Account Insights</p>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Plan</span>
                    <span className="font-bold text-white">Premium</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-gray-400">Watchlist Items</span>
                    <span className="font-bold text-white">Synced with your profile</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-gray-400">Status</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1"><Sparkles size={14} /> Active</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-black tracking-widest text-gray-300 mb-1 uppercase">Family Safe Mode</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Filter out romance and adult-themed content from all searches and recommendations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onFamilySafeModeChange && onFamilySafeModeChange(!familySafeMode)}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                      familySafeMode ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                        familySafeMode ? 'left-8' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mt-3">
                  <p className="text-xs text-amber-200">
                    {familySafeMode 
                      ? '✓ Romance and adult content is currently filtered out' 
                      : 'Romance and adult content may appear in searches'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-6 min-h-6 text-sm text-emerald-300 font-semibold flex items-center gap-2">
            {saved && (
              <>
                <CheckCircle2 size={16} /> Saved successfully
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

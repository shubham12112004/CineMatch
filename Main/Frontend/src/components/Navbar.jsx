import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Film,
  Home,
  List,
  Menu,
  MessageSquare,
  Mic,
  MoonStar,
  Search,
  Shuffle,
  Sparkles,
  User,
  X,
  Clapperboard,
  SlidersHorizontal,
  Tv,
  PlaySquare,
  WandSparkles,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFromTMDB } from '../services/tmdb';

export default function Navbar({
  onSearch,
  onHome,
  onSurpriseMe,
  onSmartFinder,
  onPreferenceSearch,
  onCompare,
  onMyList,
  onSettings,
  onPreferences,
  onTheme,
  onAccount,
  onChat,
  onManageProfile,
  selectedCountry,
  onCountryChange,
  browseType = 'all',
  onBrowseTypeChange,
  selectedLanguage,
  onLanguageChange,
  currentUser,
  onLogout,
  onLogin,
  notifications = [],
  onNotificationsOpen,
}) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const desktopProfileRef = useRef(null);
  const moreMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const quickTabs = useMemo(() => ([
    { key: 'all', label: 'Home', icon: Home, action: onHome },
    { key: 'movie', label: 'Movies', icon: Film, action: () => onBrowseTypeChange?.('movie') },
    { key: 'series', label: 'TV Shows', icon: Tv, action: () => onBrowseTypeChange?.('series') },
    { key: 'list', label: 'My List', icon: List, action: onMyList },
  ]), [onBrowseTypeChange, onHome, onMyList]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }

      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }

      if (desktopProfileRef.current && !desktopProfileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }

      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileMenu || showMobileSearch) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }

    document.body.style.overflow = '';
    return undefined;
  }, [showMobileMenu, showMobileSearch]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
        setShowMobileSearch(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const data = await fetchFromTMDB('search/multi', {
          query,
          language: selectedLanguage === 'all' ? 'en-US' : selectedLanguage,
          region: selectedCountry === 'GLOBAL' ? '' : selectedCountry,
          include_adult: false,
        });

        const items = (data.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv');
        setSuggestions(items.slice(0, 5));
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search suggestions failed', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 250);
    return () => clearTimeout(debounce);
  }, [query, selectedLanguage, selectedCountry]);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      onSearch(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    const title = suggestion.title || suggestion.name;
    setQuery(title);
    onSearch(title);
    setShowSuggestions(false);
  };

  const browseMenu = [
    { label: 'All content', value: 'all', description: 'Overview rail' },
    { label: 'Movies', value: 'movie', description: 'Films only' },
    { label: 'TV Shows', value: 'series', description: 'Series only' },
    { label: 'Drama', value: 'drama', description: 'Story-first picks' },
  ];

  const moreActions = [
    { label: 'Smart Finder', icon: Sparkles, action: onSmartFinder, tone: 'text-violet-200' },
    { label: 'Compare Titles', icon: SlidersHorizontal, action: onCompare, tone: 'text-amber-200' },
    { label: 'AI Chat', icon: MessageSquare, action: onChat, tone: 'text-cyan-200' },
    { label: 'Surprise Me', icon: Shuffle, action: onSurpriseMe, tone: 'text-emerald-200' },
    { label: 'Recommendations', icon: WandSparkles, action: onPreferenceSearch, tone: 'text-pink-200' },
    { label: 'Settings', icon: MoonStar, action: () => onSettings?.(), tone: 'text-slate-200' },
  ];

  const timeAgo = (isoDate) => {
    const time = new Date(isoDate).getTime();
    const diffMs = Date.now() - time;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const setBrowseAndClose = (value) => {
    onBrowseTypeChange?.(value);
    setShowMobileMenu(false);
    setShowMoreMenu(false);
    onHome?.();
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-black/72 backdrop-blur-2xl border-b border-white/8 shadow-[0_12px_50px_rgba(0,0,0,0.38)]' : 'bg-linear-to-b from-black/88 via-black/55 to-transparent'
      }`}
    >
      <div className="section-shell">
        <div className="hidden md:flex items-center gap-4 py-4">
          <button
            onClick={onHome}
            className="flex items-center gap-3 shrink-0"
            aria-label="Go to home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-lg">
              <Clapperboard size={22} className="text-red-400" />
            </span>
            <span className="text-2xl font-black tracking-[-0.06em] text-white">
              Cine<span className="text-red-400">Match</span>
            </span>
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            {quickTabs.map(({ key, label, icon: Icon, action }) => (
              <button
                key={key}
                onClick={action}
                className={`nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white/82 transition-all hover:bg-white/8 hover:text-white ${browseType === key ? 'border-white/20 bg-white/10 text-white' : ''}`}
              >
                <Icon size={15} className={browseType === key ? 'text-red-300' : 'text-white/60'} />
                {label}
              </button>
            ))}

            <div className="relative ml-2 min-w-0 flex-1 max-w-[34rem]" ref={desktopSearchRef}>
              <form onSubmit={handleSearch} className="nav-pill flex h-12 items-center gap-3 rounded-full px-4">
                <Search size={16} className="text-white/45" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, shows, cast..."
                  onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                />
                <button type="button" onClick={startVoiceSearch} className="text-white/55 transition-colors hover:text-white" title="Voice search">
                  <Mic size={16} className={isListening ? 'animate-pulse text-red-300' : ''} />
                </button>
              </form>

              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl"
                  >
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="flex w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 last:border-0"
                      >
                        <div className="h-14 w-10 overflow-hidden rounded-xl bg-white/5" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-white">{item.title || item.name}</p>
                          <p className="text-xs text-white/45">{item.media_type?.toUpperCase() || 'TITLE'} • {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={moreMenuRef}>
              <button
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className="nav-pill inline-flex h-12 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/85"
              >
                <Menu size={16} />
                More
                <ChevronDown size={14} className="text-white/55" />
              </button>

              <AnimatePresence>
                {showMoreMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className="absolute right-0 top-full mt-2 w-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/96 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="border-b border-white/8 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/50">Advanced tools</p>
                    </div>
                    <div className="grid gap-2 p-3">
                      {moreActions.map(({ label, icon: Icon, action, tone }) => (
                        <button
                          key={label}
                          onClick={() => {
                            action?.();
                            setShowMoreMenu(false);
                          }}
                          className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3 text-left transition-all hover:border-white/12 hover:bg-white/[0.06]"
                        >
                          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ${tone}`}>
                            <Icon size={18} />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-white">{label}</span>
                            <span className="block text-xs text-white/45">Open the modal or assistant</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-white/8 p-3">
                      {browseMenu.map((item) => (
                        <button
                          key={item.value}
                          onClick={() => setBrowseAndClose(item.value)}
                          className={`rounded-2xl px-4 py-3 text-left transition-all ${browseType === item.value ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-white/80 hover:bg-white/[0.06]'}`}
                        >
                          <span className="block text-sm font-semibold">{item.label}</span>
                          <span className="block text-xs text-white/45">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications((prev) => {
                    const next = !prev;
                    if (next && onNotificationsOpen) onNotificationsOpen();
                    return next;
                  });
                }}
                className="nav-pill relative inline-flex h-12 w-12 items-center justify-center rounded-full text-white"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/96 shadow-2xl backdrop-blur-2xl"
                  >
                    <div className="border-b border-white/8 px-4 py-3">
                      <p className="text-sm font-semibold text-white">Notifications</p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setShowNotifications(false);
                              onMyList?.();
                            }}
                            className="w-full border-b border-white/5 px-4 py-3 text-left transition-colors hover:bg-white/5 last:border-0"
                          >
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-white/55">{item.message}</p>
                            <p className="mt-1 text-[11px] text-white/35">{timeAgo(item.createdAt)}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-sm text-white/40">No notifications yet</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={desktopProfileRef}>
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                    className="nav-pill flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white"
                    title={currentUser.name}
                    aria-label="Profile"
                  >
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/96 shadow-2xl backdrop-blur-2xl"
                      >
                        <div className="px-4 py-4 border-b border-white/8">
                          <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                          <p className="text-xs text-white/45">{currentUser.email || 'Your account'}</p>
                        </div>
                        <div className="grid gap-1 p-2">
                          {[
                            ['Profile & Settings', onManageProfile],
                            ['My List', onMyList],
                            ['Preferences', onPreferences || onSettings],
                            ['Theme', onTheme || onSettings],
                            ['Account', onAccount || onSettings],
                            ['AI Chat', onChat],
                          ].map(([label, action]) => (
                            <button
                              key={label}
                              onClick={() => {
                                action?.();
                                setShowProfileMenu(false);
                              }}
                              className="rounded-2xl px-4 py-3 text-left text-sm text-white/82 transition-colors hover:bg-white/5"
                            >
                              {label}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              onLogout?.();
                              setShowProfileMenu(false);
                            }}
                            className="rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <button
                  onClick={onLogin}
                  className="nav-pill inline-flex h-12 items-center gap-2 rounded-full bg-red-500/90 px-4 text-sm font-semibold text-white hover:bg-red-500"
                >
                  <User size={16} />
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden py-3">
          <div className="flex items-center justify-between gap-3">
            <button onClick={onHome} className="flex items-center gap-3" aria-label="Go to home">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Clapperboard size={18} className="text-red-400" />
              </span>
              <span className="text-xl font-black tracking-[-0.06em] text-white">
                Cine<span className="text-red-400">Match</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="nav-pill inline-flex h-11 w-11 items-center justify-center rounded-full text-white"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickTabs.map(({ key, label, icon: Icon, action }) => (
              <button
                key={`mobile-${key}`}
                onClick={action}
                className="nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80 whitespace-nowrap"
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
            <button onClick={() => setShowMobileSearch(true)} className="nav-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white/80 whitespace-nowrap">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-70 bg-black/72 backdrop-blur-sm md:hidden"
          >
            <div className="absolute inset-x-0 bottom-0 rounded-t-[1.5rem] border-t border-white/10 bg-slate-950 p-4 bottom-nav-safe">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">CineMatch</p>
                  <h2 className="text-lg font-semibold text-white">Quick actions</h2>
                </div>
                <button onClick={() => setShowMobileMenu(false)} className="nav-pill inline-flex h-10 w-10 items-center justify-center rounded-full text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { onHome?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">Home</button>
                <button onClick={() => { onMyList?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">My List</button>
                <button onClick={() => { onSmartFinder?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">Smart Finder</button>
                <button onClick={() => { onChat?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">AI Chat</button>
                <button onClick={() => { onCompare?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">Compare</button>
                <button onClick={() => { onSurpriseMe?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">Surprise Me</button>
              </div>

              <div className="mt-3 grid gap-2">
                {browseMenu.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setBrowseAndClose(item.value)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => { onLogin?.(); setShowMobileMenu(false); }} className="rounded-2xl border border-red-500/20 bg-red-500/12 px-4 py-3 text-left text-sm font-semibold text-red-200">
                  {currentUser ? 'Profile' : 'Login'}
                </button>
                <button onClick={() => { onNotificationsOpen?.(); setShowNotifications((prev) => !prev); setShowMobileMenu(false); }} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white">
                  Notifications
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-80 bg-black/75 backdrop-blur-sm md:hidden"
          >
            <div className="absolute inset-x-0 top-0 p-4 pt-5">
              <div ref={mobileSearchRef} className="glass-panel rounded-3xl p-3">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Search</p>
                    <h2 className="text-lg font-semibold text-white">Find a title</h2>
                  </div>
                  <button onClick={() => setShowMobileSearch(false)} className="nav-pill inline-flex h-10 w-10 items-center justify-center rounded-full text-white">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSearch} className="nav-pill flex h-12 items-center gap-3 rounded-full px-4">
                  <Search size={16} className="text-white/45" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search movies, shows, cast..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/35 outline-none"
                  />
                  <button type="button" onClick={startVoiceSearch} className="text-white/55 transition-colors hover:text-white">
                    <Mic size={16} className={isListening ? 'animate-pulse text-red-300' : ''} />
                  </button>
                </form>

                <div className="mt-3 grid gap-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                  {showSuggestions && suggestions.length > 0 ? suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSuggestionClick(item);
                        setShowMobileSearch(false);
                      }}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-left"
                    >
                      <div className="h-14 w-10 rounded-xl bg-white/5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{item.title || item.name}</p>
                        <p className="text-xs text-white/45">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</p>
                      </div>
                    </button>
                  )) : (
                    <p className="px-1 py-10 text-center text-sm text-white/40">Type at least 2 characters to search.</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-2xl bottom-nav-safe">
        <div className="grid grid-cols-5 gap-1 px-2 pt-2">
          {[
            { label: 'Home', icon: Home, action: onHome },
            { label: 'Movies', icon: Film, action: () => onBrowseTypeChange?.('movie') },
            { label: 'TV', icon: Tv, action: () => onBrowseTypeChange?.('series') },
            { label: 'Search', icon: Search, action: () => setShowMobileSearch(true) },
            { label: 'More', icon: Menu, action: () => setShowMobileMenu(true) },
          ].map(({ label, icon: Icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[11px] font-semibold text-white/65 transition-colors hover:text-white"
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

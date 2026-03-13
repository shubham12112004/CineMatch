import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Shuffle, MessageSquare, Globe, Mic, TrendingUp, User, Home, List, Layers, Sparkles, Menu, X } from 'lucide-react';
import { fetchFromTMDB, POSTER_BASE_URL } from '../services/tmdb';
import CustomSelect from './CustomSelect';
import NavButton from './NavButton';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar({ onSearch, onHome, onSurpriseMe, onSmartFinder, onPreferenceSearch, onCompare, onMyList, onSettings, onPreferences, onTheme, onAccount, onChat, onManageProfile, selectedCountry, onCountryChange, browseType = 'all', onBrowseTypeChange, selectedLanguage, onLanguageChange, currentUser, onLogout, notifications = [], onNotificationsOpen }) {
  const isGlobalCountrySelection = (code) => code === 'GLOBAL' || code === 'RANDOM';

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const desktopProfileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideDesktopSearch = desktopSearchRef.current?.contains(event.target);
      const isInsideMobileSearch = mobileSearchRef.current?.contains(event.target);
      if (!isInsideDesktopSearch && !isInsideMobileSearch) {
        setShowSuggestions(false);
      }

      const isInsideDesktopProfile = desktopProfileRef.current?.contains(event.target);
      if (!isInsideDesktopProfile) {
        setShowProfileMenu(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileMenu) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
    document.body.style.overflow = '';
  }, [showMobileMenu]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!showMobileMenu) {
      setShowNotifications(false);
    }
  }, [showMobileMenu]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const countryLanguageMap = {
          IN: ['hi', 'ta', 'te', 'kn', 'ml', 'pa', 'bn'],
          PK: ['ur', 'pa', 'sd'],
          TR: ['tr'],
          US: ['en', 'es'],
          GB: ['en'],
          KR: ['ko'],
          JP: ['ja'],
        };

        const countryCode = isGlobalCountrySelection(selectedCountry) ? '' : selectedCountry;
        const langSet = new Set((countryLanguageMap[countryCode] || []).map((l) => l.toLowerCase()));
        const isLocalMatch = (item) => {
          if (!countryCode) return true;
          const originCountries = Array.isArray(item.origin_country) ? item.origin_country : [];
          const originalLang = String(item.original_language || '').toLowerCase();
          return originCountries.includes(countryCode) || langSet.has(originalLang);
        };

        const data = await fetchFromTMDB('search/multi', { 
          query, 
          language: selectedLanguage === 'all' ? 'en-US' : selectedLanguage,
          region: countryCode,
          include_adult: false
        });
        const filteredResults = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
        const prioritized = countryCode && selectedLanguage === 'all'
          ? [...filteredResults.filter(isLocalMatch), ...filteredResults.filter((item) => !isLocalMatch(item))]
          : filteredResults;

        const strictCountryOnly = countryCode
          ? prioritized.filter(isLocalMatch)
          : prioritized;

        setSuggestions(strictCountryOnly.slice(0, 6));
        setShowSuggestions(true);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [query, selectedLanguage, selectedCountry]);
  const [isListening, setIsListening] = useState(false);

  const startVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
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

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'TR', name: 'Turkey' },
    { code: 'US', name: 'USA' },
    { code: 'GB', name: 'UK' },
    { code: 'KR', name: 'S. Korea' },
    { code: 'JP', name: 'Japan' },
    { code: 'GLOBAL', name: 'Global' },
  ];

  const browseTypeOptions = [
    { value: 'all', label: 'All Content', shortLabel: 'All' },
    { value: 'movie', label: 'Movies', shortLabel: 'Mov' },
    { value: 'series', label: 'Series', shortLabel: 'Ser' },
    { value: 'drama', label: 'Drama', shortLabel: 'Dra' },
  ];

  const languagesMap = {
    'IN': [
      { code: 'hi', name: 'Hindi' },
      { code: 'ta', name: 'Tamil' },
      { code: 'te', name: 'Telugu' },
      { code: 'kn', name: 'Kannada' },
      { code: 'ml', name: 'Malayalam' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'bn', name: 'Bengali' },
    ],
    'PK': [
      { code: 'ur', name: 'Urdu' },
      { code: 'pa', name: 'Punjabi' },
      { code: 'sd', name: 'Sindhi' },
    ],
    'TR': [
      { code: 'tr', name: 'Turkish' },
    ],
    'US': [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
    ],
    'GB': [
      { code: 'en', name: 'English' },
    ],
    'KR': [
      { code: 'ko', name: 'Korean' },
    ],
    'JP': [
      { code: 'ja', name: 'Japanese' },
    ],
  };

  const currentLanguages = languagesMap[selectedCountry] || [];

  const allLanguageOptions = [
    ...Object.values(languagesMap).flat()
  ].reduce((acc, item) => {
    if (!acc.find(lang => lang.code === item.code)) {
      acc.push(item);
    }
    return acc;
  }, []);

  const languageOptions = [
    { value: 'all', label: 'All Languages', shortLabel: 'Lan' },
    ...((isGlobalCountrySelection(selectedCountry) ? allLanguageOptions : currentLanguages).map((lang) => ({
      value: lang.code,
      label: lang.name,
      shortLabel: String(lang.name).slice(0, 3)
    })))
  ];

  useEffect(() => {
    const isValidLanguage = languageOptions.some(lang => lang.value === selectedLanguage);
    if (!isValidLanguage) {
      onLanguageChange('all');
    }
  }, [selectedCountry, selectedLanguage, onLanguageChange, languageOptions]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const title = suggestion.title || suggestion.name;
    setQuery(title);
    onSearch(title);
    setShowSuggestions(false);
    setQuery('');
  };

  const unreadCount = notifications.filter(item => !item.read).length;

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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-black/70 backdrop-blur-lg border-b border-white/10 shadow-xl' 
        : 'bg-linear-to-b from-black/90 via-black/60 to-transparent'
    }`}>
      <div className="px-4 md:px-6 lg:px-8 py-3 md:py-4">
        {/* Desktop Layout - Single Unified Row */}
        <div className="hidden md:flex items-center min-w-0">
          {/* Left Section - Logo + Navigation */}
          <div className="flex items-center min-w-0 flex-1">
            {/* Logo */}
            <h1
              onClick={onHome}
              className="logo-font logo-rainbow-glow -ml-1 shrink-0 cursor-pointer text-5xl md:text-6xl leading-none transition-transform hover:scale-105"
              aria-label="Go to home"
            >
              CineMatch
            </h1>

            <div className="flex items-center gap-2 min-w-0 flex-1 justify-center px-2">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 min-w-0 max-w-[58vw] overflow-x-auto no-scrollbar pr-1">
                <NavButton onClick={onHome} icon={Home} colorTheme="red">
                  Home
                </NavButton>
                <NavButton onClick={onMyList} icon={List} colorTheme="emerald">
                  My List
                </NavButton>
                <NavButton onClick={onSmartFinder} icon={Sparkles} colorTheme="violet">
                  Smart Finder
                </NavButton>
                <NavButton onClick={onCompare} icon={Layers} colorTheme="amber">
                  Compare
                </NavButton>
                <NavButton onClick={onChat} icon={MessageSquare} colorTheme="gray" variant="highlight">
                  AI Chat
                </NavButton>
                <NavButton onClick={onSurpriseMe} icon={Shuffle} colorTheme="cyan">
                  Surprise Me
                </NavButton>
              </div>

              {/* Country & Language Selectors */}
              <div className="flex items-center gap-2 shrink-0">
                <CustomSelect
                  options={browseTypeOptions}
                  value={browseType}
                  onChange={onBrowseTypeChange}
                  placeholder="Type"
                  buttonLabel="Type"
                  colorTheme="red"
                  buttonWidth="w-20"
                />

                <CustomSelect
                  options={countries.map(c => ({ value: c.code, label: c.name }))}
                  value={selectedCountry}
                  onChange={onCountryChange}
                  placeholder="Country"
                  colorTheme="emerald"
                  icon={Globe}
                  buttonWidth="w-24"
                />

                <CustomSelect
                  options={languageOptions}
                  value={selectedLanguage}
                  onChange={onLanguageChange}
                  placeholder="Lan"
                  buttonLabel="Lan"
                  colorTheme="violet"
                  buttonWidth="w-20"
                />
              </div>
            </div>
          </div>
          {/* Right Section - Search, Notifications, Profile */}
          <div className="ml-4 -mr-0.5 flex items-center gap-2 shrink-0">
            {/* Smart Search */}
            <div className="relative shrink-0" ref={desktopSearchRef}>
              <div className="relative">
                <form onSubmit={handleSearch} className="h-10 flex items-center bg-black/85 backdrop-blur-md border border-cyan-500/45 px-2.5 rounded-xl shadow-xl transition-all duration-300">
                  <Search size={16} className="mr-2 text-gray-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    placeholder="Search titles..."
                    className="bg-transparent outline-none text-sm w-56 text-white placeholder:text-gray-500"
                  />
                  <Mic 
                    size={16} 
                    className={`cursor-pointer transition-colors ${isListening ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-white'}`} 
                    onClick={startVoiceSearch}
                    title="Voice Search"
                  />
                </form>

                {/* Enhanced Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-100 backdrop-blur-xl">
                    {suggestions.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleSuggestionClick(item)}
                        className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0 group"
                      >
                        <div className="w-12 h-16 shrink-0 bg-gray-800 rounded overflow-hidden relative">
                          {item.poster_path ? (
                            <img 
                              src={`${POSTER_BASE_URL}${item.poster_path}`} 
                              alt="" 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">No Img</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate group-hover:text-red-500 transition-colors">
                            {item.title || item.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span className="uppercase font-semibold">{item.media_type}</span>
                            <span>•</span>
                            <span>{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</span>
                            {item.vote_average > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-yellow-500">
                                  <TrendingUp size={12} />
                                  {item.vote_average.toFixed(1)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setShowNotifications((prev) => {
                    const next = !prev;
                    if (next && onNotificationsOpen) onNotificationsOpen();
                    return next;
                  });
                }}
                className="w-10 h-10 flex items-center justify-center bg-amber-900/35 border border-amber-500/50 text-amber-200 hover:bg-amber-800/45 hover:border-amber-400/80 rounded-xl transition-all relative shadow-lg"
                title="Notifications"
              >
                <Bell size={16} className="text-amber-200" />
                {/* Notification Badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-600 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-100 overflow-hidden backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-white/10 bg-linear-to-r from-red-600/10 to-purple-600/10">
                    <p className="text-sm font-bold text-white">Notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setShowNotifications(false);
                            onMyList();
                          }}
                          className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="text-xs text-gray-300 mt-1 line-clamp-2">{item.message}</p>
                          <p className="text-[11px] text-gray-500 mt-1">{timeAgo(item.createdAt)}</p>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile with Gmail-Style Dropdown */}
            <div className="relative shrink-0" ref={desktopProfileRef}>
              <button
                onClick={() => {
                  if (currentUser) {
                    setShowProfileMenu((prev) => !prev);
                  } else if (onSettings) {
                    onSettings();
                  }
                }}
                className="w-10 h-10 bg-linear-to-br from-fuchsia-700/70 to-purple-700/70 border border-fuchsia-400/60 rounded-xl flex items-center justify-center text-white font-bold cursor-pointer hover:brightness-110 transition-all shadow-lg"
                title={currentUser ? currentUser.name : 'Profile'}
                aria-label="Profile"
              >
                {currentUser ? (
                  currentUser.name?.charAt(0).toUpperCase()
                ) : (
                  <User size={18} className="text-fuchsia-100" />
                )}
              </button>
              {currentUser && showProfileMenu && (
                <ProfileDropdown 
                  user={currentUser} 
                  onClose={() => setShowProfileMenu(false)}
                  onLogout={onLogout}
                  onOpenManageProfile={onManageProfile}
                  onOpenMyList={onMyList}
                  onOpenPreferences={onPreferences || onSettings}
                  onOpenTheme={onTheme || onSettings}
                  onOpenAccount={onAccount || onSettings}
                  onOpenChat={onChat}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden pb-1">
          <div className="flex items-center justify-between gap-2">
            <h1
              onClick={onHome}
              className="logo-font logo-rainbow-glow cursor-pointer text-4xl leading-none transition-transform hover:scale-105"
              aria-label="Go to home"
            >
              CineMatch
            </h1>
            <button
              type="button"
              onClick={() => setShowMobileMenu(true)}
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-white/20 bg-black/55 text-white"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>

          {showMobileMenu && (
            <>
              <div className="fixed inset-0 z-70 bg-black/70" onClick={() => setShowMobileMenu(false)} />
              <aside className="fixed right-0 top-0 z-80 h-screen w-[min(90vw,22rem)] overflow-y-auto border-l border-white/15 bg-[#0c0d10] p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Menu</h2>
                  <button
                    type="button"
                    onClick={() => setShowMobileMenu(false)}
                    className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mb-3" ref={mobileSearchRef}>
                  <form onSubmit={handleSearch} className="h-10 flex items-center bg-black/85 backdrop-blur-md border border-cyan-500/45 px-2.5 rounded-xl shadow-xl transition-all duration-300">
                    <Search size={16} className="mr-2 text-gray-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                      placeholder="Search titles..."
                      className="bg-transparent outline-none text-sm flex-1 text-white placeholder:text-gray-500"
                    />
                    <Mic
                      size={16}
                      className={`cursor-pointer transition-colors ${isListening ? 'text-red-600 animate-pulse' : 'text-gray-400 hover:text-white'}`}
                      onClick={startVoiceSearch}
                      title="Voice Search"
                    />
                  </form>

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-90 backdrop-blur-xl">
                      {suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSuggestionClick(item)}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0"
                        >
                          <div className="w-10 h-14 shrink-0 bg-gray-800 rounded overflow-hidden relative">
                            {item.poster_path ? (
                              <img
                                src={`${POSTER_BASE_URL}${item.poster_path}`}
                                alt=""
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-600">No Img</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{item.title || item.name}</p>
                            <p className="text-[11px] text-gray-400 mt-1">{item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <button onClick={() => { onHome(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-red-500/40 bg-red-900/20 text-red-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <Home size={15} /> Home
                  </button>
                  <button onClick={() => { onMyList(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-emerald-500/40 bg-emerald-900/20 text-emerald-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <List size={15} /> My List
                  </button>
                  <button onClick={() => { onSurpriseMe(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-cyan-500/40 bg-cyan-900/20 text-cyan-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <Shuffle size={15} /> Surprise Me
                  </button>
                  <button onClick={() => { onSmartFinder(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-violet-500/40 bg-violet-900/20 text-violet-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <Sparkles size={15} /> Smart Finder
                  </button>
                  <button onClick={() => { onCompare(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-amber-500/40 bg-amber-900/20 text-amber-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <Layers size={15} /> Compare
                  </button>
                  <button onClick={() => { onChat(); setShowMobileMenu(false); }} className="w-full h-10 rounded-xl border border-red-500/40 bg-red-900/20 text-red-200 text-sm font-semibold inline-flex items-center gap-2 px-3">
                    <MessageSquare size={15} /> AI Chat
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-4">
                  <CustomSelect
                    options={browseTypeOptions}
                    value={browseType}
                    onChange={onBrowseTypeChange}
                    placeholder="Type"
                    buttonLabel="Type"
                    colorTheme="red"
                    buttonWidth="w-full"
                    buttonClassName="h-10 text-xs"
                    menuClassName="left-0"
                  />
                  <CustomSelect
                    options={countries.map(c => ({ value: c.code, label: c.name }))}
                    value={selectedCountry}
                    onChange={onCountryChange}
                    placeholder="Country"
                    colorTheme="emerald"
                    icon={Globe}
                    buttonWidth="w-full"
                    buttonClassName="h-10 text-xs"
                    menuClassName="left-0"
                  />
                  <CustomSelect
                    options={languageOptions}
                    value={selectedLanguage}
                    onChange={onLanguageChange}
                    placeholder="Language"
                    buttonLabel="Language"
                    colorTheme="violet"
                    buttonWidth="w-full"
                    buttonClassName="h-10 text-xs"
                    menuClassName="left-0"
                  />
                </div>

                <div className="space-y-2" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setShowNotifications((prev) => {
                        const next = !prev;
                        if (next && onNotificationsOpen) onNotificationsOpen();
                        return next;
                      });
                    }}
                    className="w-full h-10 rounded-xl border border-amber-500/40 bg-amber-900/20 text-amber-200 text-sm font-semibold inline-flex items-center justify-between px-3"
                  >
                    <span className="inline-flex items-center gap-2"><Bell size={15} /> Notifications</span>
                    {unreadCount > 0 && <span className="text-xs">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </button>
                  {showNotifications && (
                    <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/35">
                      {notifications.length > 0 ? (
                        notifications.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setShowNotifications(false);
                              setShowMobileMenu(false);
                              onMyList();
                            }}
                            className="w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{item.message}</p>
                            <p className="text-[11px] text-gray-500 mt-1">{timeAgo(item.createdAt)}</p>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-gray-400">No notifications yet</div>
                      )}
                    </div>
                  )}

                  {currentUser ? (
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        if (onManageProfile) onManageProfile();
                      }}
                      className="w-full h-10 rounded-xl border border-fuchsia-500/40 bg-fuchsia-900/20 text-fuchsia-200 text-sm font-semibold inline-flex items-center gap-2 px-3"
                    >
                      <User size={15} /> Profile & Settings
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowMobileMenu(false);
                        if (onSettings) onSettings();
                      }}
                      className="w-full h-10 rounded-xl border border-fuchsia-500/40 bg-fuchsia-900/20 text-fuchsia-200 text-sm font-semibold inline-flex items-center gap-2 px-3"
                    >
                      <User size={15} /> Account
                    </button>
                  )}
                </div>
              </aside>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

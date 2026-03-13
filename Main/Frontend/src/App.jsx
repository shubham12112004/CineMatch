import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieRow from './components/MovieRow';
import MovieCard from './components/MovieCard';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import AgeVerification from './components/AgeVerification';
import { GoogleGenAI } from "@google/genai";
import { Github, Instagram, Linkedin } from 'lucide-react';import { 
  getMovieDetails,
  getTVDetails,
  discoverTV,
  discoverContent,
  fetchFromTMDB,
  searchPerson
} from './services/tmdb';

const GENRE_NAME_TO_ID = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'sci-fi': 878,
  'science fiction': 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const MovieDetail = lazy(() => import('./components/MovieDetail'));
const SmartFinder = lazy(() => import('./components/SmartFinder'));
const CompareMovies = lazy(() => import('./components/CompareMovies'));
const MyList = lazy(() => import('./components/MyList'));
const Settings = lazy(() => import('./components/Settings'));
const CineChat = lazy(() => import('./components/CineChat'));
const ManageProfile = lazy(() => import('./components/ManageProfile'));
const PrivacyPolicy = lazy(() => import('./components/InfoPages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/InfoPages/TermsOfService'));
const AboutPage = lazy(() => import('./components/InfoPages/AboutPage'));
const ContactPage = lazy(() => import('./components/InfoPages/ContactPage'));

function OverlayFallback() {
  return (
    <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
    const isGlobalCountrySelection = (code) => code === 'GLOBAL' || code === 'RANDOM';

  // ===== ALL HOOKS MUST BE DECLARED FIRST (before any early returns) =====

  // Auth states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Content states
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [browseType, setBrowseType] = useState('all');
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [topRatedTV, setTopRatedTV] = useState([]);
  
  // Country specific states
  const [countryMovies, setCountryMovies] = useState([]);
  const [countrySeries, setCountrySeries] = useState([]);
  const [countryDrama, setCountryDrama] = useState([]);
  const [countryComedy, setCountryComedy] = useState([]);
  const [countryFamily, setCountryFamily] = useState([]);
  const [countryCartoon, setCountryCartoon] = useState([]);
  const [countryCrime, setCountryCrime] = useState([]);
  const [countryAction, setCountryAction] = useState([]);
  const [countryAdventure, setCountryAdventure] = useState([]);
  const [countryRomance, setCountryRomance] = useState([]);
  const [seriesDrama, setSeriesDrama] = useState([]);
  const [seriesComedy, setSeriesComedy] = useState([]);
  const [seriesFamily, setSeriesFamily] = useState([]);
  const [seriesCrime, setSeriesCrime] = useState([]);
  const [seriesFantasy, setSeriesFantasy] = useState([]);
  const [seriesAnimation, setSeriesAnimation] = useState([]);
  const [seriesThriller, setSeriesThriller] = useState([]);

  const [heroMovie, setHeroMovie] = useState(null);
  const [heroPool, setHeroPool] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isTV, setIsTV] = useState(false);
  const [showSmartFinder, setShowSmartFinder] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [showMyList, setShowMyList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('preferences');
  const [infoPage, setInfoPage] = useState(null); // 'privacy' | 'terms' | 'about' | 'contact'
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('cineMatch_themeMode') || 'default');
  const [backgroundFx, setBackgroundFx] = useState(() => localStorage.getItem('cineMatch_backgroundFx') || 'none');
  const [familySafeMode, setFamilySafeMode] = useState(() => {
    const saved = localStorage.getItem('cineMatch_familySafeMode');
    return saved === 'true';
  });
  const [showChat, setShowChat] = useState(false);
  const [chatSeedMessage, setChatSeedMessage] = useState('');
  const [showManageProfile, setShowManageProfile] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const [myList, setMyList] = useState(() => {
    const saved = localStorage.getItem('cineMatch_myList');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('cineMatch_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Age verification for adult content
  const [isAdult, setIsAdult] = useState(() => {
    const saved = localStorage.getItem('cineMatch_isAdult');
    return saved === 'true';
  });
  const [showAgeWarning, setShowAgeWarning] = useState(() => {
    const saved = localStorage.getItem('cineMatch_ageWarning');
    return saved !== 'dismissed';
  });

  const [error, setError] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);

  // ===== ALL EFFECTS MUST COME AFTER ALL STATES =====

  // Check for stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.clear();
      }
    }
    setAuthLoading(false);
  }, []);

  // Save myList to localStorage
  useEffect(() => {
    localStorage.setItem('cineMatch_myList', JSON.stringify(myList));
  }, [myList]);

  useEffect(() => {
    localStorage.setItem('cineMatch_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cineMatch_themeMode', themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('cineMatch_backgroundFx', backgroundFx);
  }, [backgroundFx]);

  useEffect(() => {
    localStorage.setItem('cineMatch_familySafeMode', familySafeMode.toString());
  }, [familySafeMode]);

  // Age verification handler
  const handleAgeVerification = (isConfirmed) => {
    if (isConfirmed) {
      localStorage.setItem('cineMatch_isAdult', 'true');
      setIsAdult(true);
    }
    localStorage.setItem('cineMatch_ageWarning', 'dismissed');
    setShowAgeWarning(false);
  };

  // Fetch all content
  useEffect(() => {
    const fetchAll = async () => {
      setContentLoading(true);
      setError(null);
      try {
        console.log('🎬 Fetching content for country:', selectedCountry, 'language:', selectedLanguage);
        const countryMap = {
          'IN': { lang: 'hi|ta|te|kn|ml|pa|bn', region: 'IN', name: 'Indian' },
          'PK': { lang: 'ur|pa|sd', region: 'PK', name: 'Pakistani' },
          'TR': { lang: 'tr', region: 'TR', name: 'Turkish' },
          'US': { lang: 'en', region: 'US', name: 'American' },
          'GB': { lang: 'en', region: 'GB', name: 'British' },
          'KR': { lang: 'ko', region: 'KR', name: 'Korean' },
          'JP': { lang: 'ja', region: 'JP', name: 'Japanese' },
        };

        let activeLang;
        let region;
        
        if (isGlobalCountrySelection(selectedCountry)) {
          activeLang = Object.values(countryMap).map(c => c.lang).join('|');
          region = undefined;
        } else {
          const current = countryMap[selectedCountry] || countryMap['IN'];
          activeLang = selectedLanguage === 'all' ? current.lang : selectedLanguage;
          region = current.region;
        }

        // When Family Safe Mode is enabled, exclude Romance (10749) genre
        const baseParams = familySafeMode 
          ? { include_adult: false, without_genres: 10749 } 
          : { include_adult: false };

        const [t, tr, ptv, trtv, cMovies, cSeries, cDrama, cComedy, cFamily, cCartoon, cCrime, cAction, cAdventure, cRomance, sDrama, sComedy, sFamily, sCrime, sFantasy, sAnimation, sThriller] = await Promise.all([
          discoverContent({ with_original_language: activeLang, region, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, region, sort_by: 'vote_average.desc', 'vote_count.gte': 100, ...baseParams }),
          discoverTV({ with_original_language: activeLang, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, sort_by: 'vote_average.desc', 'vote_count.gte': 100, ...baseParams }),
          discoverContent({ with_original_language: activeLang, region, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 18, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 35, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 10751, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 16, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 80, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 28, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 12, sort_by: 'popularity.desc', ...baseParams }),
          discoverContent({ with_original_language: activeLang, with_genres: 10749, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 18, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 35, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 10751, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 80, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 10765, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 16, sort_by: 'popularity.desc', ...baseParams }),
          discoverTV({ with_original_language: activeLang, with_genres: 53, sort_by: 'popularity.desc', ...baseParams }),
        ]);

        if (t.error) {
          setError('Unable to connect to TMDB API. Please check your internet connection and try again.');
          console.error('❌ TMDB API Error:', t.error);
          setContentLoading(false);
          return;
        }

        console.log('✅ Fetched trending movies:', t.results?.length || 0);

        const shuffle = (array) => {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
        };

        const processResults = (res) => {
          if (!res || !res.results) return [];
          return isGlobalCountrySelection(selectedCountry) ? shuffle(res.results) : res.results;
        };

        setTrending(processResults(t));
        setTopRated(processResults(tr));
        setPopularTV(processResults(ptv));
        setTopRatedTV(processResults(trtv));
        
        setCountryMovies(processResults(cMovies));
        setCountrySeries(processResults(cSeries));
        setCountryDrama(processResults(cDrama));
        setCountryComedy(processResults(cComedy));
        setCountryFamily(processResults(cFamily));
        setCountryCartoon(processResults(cCartoon));
        setCountryCrime(processResults(cCrime));
        setCountryAction(processResults(cAction));
        setCountryAdventure(processResults(cAdventure));
        setCountryRomance(processResults(cRomance));
        setSeriesDrama(processResults(sDrama));
        setSeriesComedy(processResults(sComedy));
        setSeriesFamily(processResults(sFamily));
        setSeriesCrime(processResults(sCrime));
        setSeriesFantasy(processResults(sFantasy));
        setSeriesAnimation(processResults(sAnimation));
        setSeriesThriller(processResults(sThriller));
        setContentLoading(false);
      } catch (err) {
        console.error('Failed to fetch initial data', err);
        setError('Failed to load content. Please refresh the page.');
        setContentLoading(false);
      }
    };

    fetchAll();
  }, [selectedCountry, selectedLanguage, familySafeMode]);

  useEffect(() => {
    const shuffle = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const isSafeForBanner = (item) => {
      if (!item) return false;
      if (item.adult) return false;

      const romanceGenreId = 10749;
      if (Array.isArray(item.genre_ids) && item.genre_ids.includes(romanceGenreId)) {
        return false;
      }

      const text = `${item.title || item.name || ''} ${item.overview || ''}`.toLowerCase();
      if (text.includes('romance') || text.includes('erotic') || text.includes('sexual')) {
        return false;
      }

      return true;
    };

    let basePool = [];

    if (browseType === 'movie') {
      basePool = [...trending.slice(0, 10), ...topRated.slice(0, 10), ...countryFamily.slice(0, 8)];
    } else if (browseType === 'series') {
      basePool = [...popularTV.slice(0, 10), ...topRatedTV.slice(0, 10), ...seriesFantasy.slice(0, 8)];
    } else if (browseType === 'drama') {
      basePool = [...countryDrama.slice(0, 10), ...seriesDrama.slice(0, 10)];
    } else {
      basePool = [...trending.slice(0, 10), ...popularTV.slice(0, 10), ...topRated.slice(0, 8)];
    }

    let finalPool = shuffle(basePool)
      .filter((item) => item?.backdrop_path)
      .filter(isSafeForBanner)
      .slice(0, 20);

    // Ensure banner never appears empty after safety filtering.
    if (finalPool.length === 0) {
      const fallbackPool = [
        ...trending,
        ...popularTV,
        ...topRated,
        ...topRatedTV,
        ...countryAction,
        ...countryAdventure,
        ...countryFamily,
        ...seriesFantasy,
        ...seriesThriller,
      ];

      finalPool = shuffle(fallbackPool)
        .filter((item) => item?.backdrop_path)
        .filter(isSafeForBanner)
        .slice(0, 20);
    }

    setHeroPool(finalPool);
    setHeroMovie(finalPool[0] || null);
    setHeroIndex(0);
  }, [browseType, trending, topRated, popularTV, topRatedTV, countryFamily, countryDrama, countryAction, seriesFantasy, seriesDrama, seriesThriller]);

  // Hero image rotation
  useEffect(() => {
    if (heroPool.length <= 1) return;

    const interval = setInterval(() => {
      setHeroIndex(prev => {
        const next = (prev + 1) % heroPool.length;
        setHeroMovie(heroPool[next]);
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [heroPool]);

  // ===== HANDLER FUNCTIONS =====

  const resetToHome = () => {
    setSearchResults(null);
    setSearchError(null);
    setIsSearching(false);
    setShowSmartFinder(false);
    setShowCompare(false);
    setInfoPage(null);
    setShowMyList(false);
    setShowSettings(false);
    setShowChat(false);
    setShowManageProfile(false);
    setSelectedMovie(null);
    setSelectedCountry('IN');
    setSelectedLanguage('all');
    setBrowseType('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMyList = (movie) => {
    setMyList(prev => {
      const exists = prev.find(m => m.id === movie.id);
      if (exists) {
        return prev.filter(m => m.id !== movie.id);
      }

      const title = movie?.title || movie?.name || 'This title';
      const typeLabel = movie?.first_air_date || movie?.media_type === 'tv' ? 'series' : 'movie';
      setNotifications(current => [
        {
          id: Date.now() + Math.random(),
          title: 'Added to My List',
          message: `${title} (${typeLabel}) added to your list.`,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...current,
      ].slice(0, 25));

      return [...prev, movie];
    });
  };

  const removeFromList = (id) => {
    setMyList(prev => prev.filter(m => m.id !== id));
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setShowAuth(false);
  };

  const openChat = (seedMessage = '') => {
    setChatSeedMessage(seedMessage);
    setShowChat(true);
  };

  const handleSmartFinderNoResults = (message) => {
    setShowSmartFinder(false);
    openChat(message);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const openSettingsTab = (tab = 'preferences') => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setSelectedLanguage('all');
  };

  const handleMovieClick = async (movie, type = 'movie') => {
    try {
      const isTvType = type === 'tv' || !!movie.first_air_date;
      const fetchFn = isTvType ? getTVDetails : getMovieDetails;
      const data = await fetchFn(movie.id);
      setSelectedMovie(data);
      setIsTV(isTvType);
    } catch (err) {
      console.error('Failed to fetch movie details', err);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);
    
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

      const activeLang = selectedLanguage === 'all' ? '' : selectedLanguage;
      const countryCode = isGlobalCountrySelection(selectedCountry) ? '' : selectedCountry;
      const countryLangSet = new Set((countryLanguageMap[countryCode] || []).map((l) => l.toLowerCase()));

      const isCountryRelevantMatch = (item) => {
        if (!countryCode) return true;
        const originCountries = Array.isArray(item.origin_country) ? item.origin_country : [];
        const originalLang = String(item.original_language || '').toLowerCase();
        return originCountries.includes(countryCode) || countryLangSet.has(originalLang);
      };

      const enforceStrictCountryMatches = async (items) => {
        if (!countryCode) return items;

        const inspected = items.slice(0, 80);
        const checks = await Promise.all(
          inspected.map(async (item) => {
            try {
              const isTv = item.media_type === 'tv' || Boolean(item.first_air_date);

              if (isTv) {
                const inlineOrigins = Array.isArray(item.origin_country) ? item.origin_country : [];
                if (inlineOrigins.includes(countryCode)) return item;

                const details = await getTVDetails(item.id);
                const detailOrigins = Array.isArray(details?.origin_country) ? details.origin_country : [];
                return detailOrigins.includes(countryCode) ? item : null;
              }

              const details = await getMovieDetails(item.id);
              const countries = (details?.production_countries || [])
                .map((country) => country?.iso_3166_1)
                .filter(Boolean);

              return countries.includes(countryCode) ? item : null;
            } catch {
              return null;
            }
          })
        );

        return checks.filter(Boolean);
      };

      const prioritizeCountryMatches = (items) => {
        if (!countryCode) return items;

        const local = [];
        const global = [];

        for (const item of items) {
          if (isCountryRelevantMatch(item)) local.push(item);
          else global.push(item);
        }

        return [...local, ...global];
      };

      let data = await fetchFromTMDB('search/multi', { 
        query, 
        language: activeLang || 'en-US',
        region: countryCode,
        include_adult: false
      });

      if (data.error) {
        throw new Error(data.error);
      }

      let finalResults = (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');

      // Filter out Romance genre (10749) when Family Safe Mode is enabled
      if (familySafeMode) {
        finalResults = finalResults.filter(item => !item.genre_ids || !item.genre_ids.includes(10749));
      }

      if (finalResults.length === 0) {
        const [movieData, tvData] = await Promise.all([
          fetchFromTMDB('search/movie', { 
            query, 
            language: activeLang || 'en-US',
            region: countryCode,
            include_adult: false
          }),
          fetchFromTMDB('search/tv', {
            query,
            language: activeLang || 'en-US',
            region: countryCode,
            include_adult: false
          }),
        ]);

        finalResults = [
          ...(movieData.results || []).map(m => ({ ...m, media_type: 'movie' })),
          ...(tvData.results || []).map(t => ({ ...t, media_type: 'tv' })),
        ];

        // Filter out Romance genre (10749) when Family Safe Mode is enabled
        if (familySafeMode) {
          finalResults = finalResults.filter(item => !item.genre_ids || !item.genre_ids.includes(10749));
        }
      }

      if (countryCode) {
        // Strict mode: only selected-country titles should appear in search results.
        if (selectedLanguage === 'all') {
          finalResults = prioritizeCountryMatches(finalResults);
        }
        finalResults = await enforceStrictCountryMatches(finalResults);
      }

      setSearchResults({ 
        results: finalResults.slice(0, 50), 
        query,
        hasMore: finalResults.length > 50 
      });
    } catch (err) {
      setSearchResults({
        results: [],
        query,
        hasMore: false,
      });
      setSearchError(err.message || 'Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePreferenceSearch = async (prefsOverride = null) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const rawPrefs = localStorage.getItem('cineMatch_userPreferences');
      const prefs = prefsOverride || (rawPrefs ? JSON.parse(rawPrefs) : null);

      if (!prefs) {
        throw new Error('No saved preferences found. Save your preferences first.');
      }

      const actorNames = (prefs.favoriteActors || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const preferredGenres = Array.isArray(prefs.preferredGenres)
        ? prefs.preferredGenres
        : [];

      if (actorNames.length === 0 && preferredGenres.length === 0) {
        throw new Error('Add at least one favorite actor or one preferred genre before running preference search.');
      }

      const genreIds = preferredGenres
        .map((genre) => GENRE_NAME_TO_ID[String(genre).trim().toLowerCase()])
        .filter(Boolean);

      const activeLang = selectedLanguage === 'all' ? '' : selectedLanguage;
      const region = isGlobalCountrySelection(selectedCountry) ? '' : selectedCountry;

      const params = {
        sort_by: 'popularity.desc',
        include_adult: false,
      };

      if (genreIds.length > 0) {
        params.with_genres = genreIds.join(',');
      }

      if (activeLang) {
        params.with_original_language = activeLang;
      }

      if (region) {
        params.region = region;
      }

      if (familySafeMode) {
        params.without_genres = 10749;
      }

      if (actorNames.length > 0) {
        try {
          const personResult = await searchPerson(actorNames[0]);
          if (personResult?.results?.length > 0) {
            params.with_people = personResult.results[0].id;
          }
        } catch (err) {
          console.warn('Preference actor search failed:', err);
        }
      }

      const [movieData, tvData] = await Promise.all([
        discoverContent(params),
        discoverTV(params),
      ]);

      let finalResults = [
        ...((movieData?.results || []).map((item) => ({ ...item, media_type: 'movie' }))),
        ...((tvData?.results || []).map((item) => ({ ...item, media_type: 'tv' }))),
      ];

      if (familySafeMode) {
        finalResults = finalResults.filter(
          (item) => !item.genre_ids || !item.genre_ids.includes(10749)
        );
      }

      if (finalResults.length === 0) {
        throw new Error('No movies found for your saved preferences. Try broader preferences.');
      }

      const actorLabel = actorNames.length > 0 ? `Actor: ${actorNames[0]}` : '';
      const genreLabel = preferredGenres.length > 0 ? `Genres: ${preferredGenres.join(', ')}` : '';
      const queryLabel = [actorLabel, genreLabel].filter(Boolean).join(' | ') || 'Saved Preferences';

      setSearchResults({
        results: finalResults.slice(0, 50),
        query: `Preference Search (${queryLabel})`,
        hasMore: finalResults.length > 50,
      });
      setShowSettings(false);
    } catch (err) {
      setSearchResults({
        results: [],
        query: 'Preference Search',
        hasMore: false,
      });
      setSearchError(err.message || 'Failed to search by preferences.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSurpriseMe = () => {
    const allMovies = [...trending, ...topRated, ...popularTV];
    const random = allMovies[Math.floor(Math.random() * allMovies.length)];
    handleMovieClick(random);
  };

  const getLanguageName = (code) => {
    const languagesMap = {
      'hi': 'Hindi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'pa': 'Punjabi', 'bn': 'Bengali',
      'ur': 'Urdu', 'sd': 'Sindhi', 'tr': 'Turkish', 'en': 'English', 'es': 'Spanish', 'ko': 'Korean', 'ja': 'Japanese'
    };
    return languagesMap[code] || '';
  };

  const getCountryName = (code) => {
    if (isGlobalCountrySelection(code)) return 'Global';
    const countries = {
      'IN': 'India', 'PK': 'Pakistan', 'TR': 'Turkey', 'US': 'USA', 'GB': 'UK', 'KR': 'S. Korea', 'JP': 'Japan'
    };
    return countries[code] || code;
  };

  const displayCountry = getCountryName(selectedCountry);
  const displayLang = selectedLanguage === 'all' ? '' : ` (${getLanguageName(selectedLanguage)})`;
  const browseTypeLabel = browseType === 'movie' ? 'Movies' : browseType === 'series' ? 'Series' : browseType === 'drama' ? 'Drama' : 'All Content';

  const movieSections = [
    { title: `Trending ${displayCountry} Movies${displayLang}`, movies: trending, isTV: false },
    { title: `${displayCountry} Action Movies${displayLang}`, movies: countryAction, isTV: false },
    { title: `${displayCountry} Adventure Movies${displayLang}`, movies: countryAdventure, isTV: false },
    { title: `${displayCountry} Family Movies${displayLang}`, movies: countryFamily, isTV: false },
    { title: `${displayCountry} Comedy Movies${displayLang}`, movies: countryComedy, isTV: false },
    { title: `${displayCountry} Romance Movies${displayLang}`, movies: countryRomance, isTV: false },
    { title: `${displayCountry} Crime Movies${displayLang}`, movies: countryCrime, isTV: false },
    { title: `${displayCountry} Animation Movies${displayLang}`, movies: countryCartoon, isTV: false },
    { title: `${displayCountry} Drama Movies${displayLang}`, movies: countryDrama, isTV: false },
    { title: `Top Rated ${displayCountry} Movies${displayLang}`, movies: topRated, isTV: false },
  ];

  const seriesSections = [
    { title: `Trending ${displayCountry} Series${displayLang}`, movies: popularTV, isTV: true },
    { title: `Top Rated ${displayCountry} Series${displayLang}`, movies: topRatedTV, isTV: true },
    { title: `${displayCountry} Drama Series${displayLang}`, movies: seriesDrama, isTV: true },
    { title: `${displayCountry} Comedy Series${displayLang}`, movies: seriesComedy, isTV: true },
    { title: `${displayCountry} Family Series${displayLang}`, movies: seriesFamily, isTV: true },
    { title: `${displayCountry} Crime Series${displayLang}`, movies: seriesCrime, isTV: true },
    { title: `${displayCountry} Fantasy Series${displayLang}`, movies: seriesFantasy, isTV: true },
    { title: `${displayCountry} Thriller Series${displayLang}`, movies: seriesThriller, isTV: true },
    { title: `${displayCountry} Animation Series${displayLang}`, movies: seriesAnimation, isTV: true },
  ];

  const dramaSections = [
    { title: `${displayCountry} Drama Movies${displayLang}`, movies: countryDrama, isTV: false },
    { title: `${displayCountry} Drama Series${displayLang}`, movies: seriesDrama, isTV: true },
  ];

  const homeSections = browseType === 'movie'
    ? movieSections
    : browseType === 'series'
      ? seriesSections
      : browseType === 'drama'
        ? dramaSections
        : [
            { title: `Trending ${displayCountry}${displayLang}`, movies: trending, isTV: false },
            { title: `${displayCountry} Trending Series${displayLang}`, movies: countrySeries, isTV: true },
            { title: `${displayCountry} Action Movies${displayLang}`, movies: countryAction, isTV: false },
            { title: `${displayCountry} Drama Movies${displayLang}`, movies: countryDrama, isTV: false },
            { title: `${displayCountry} Crime Movies${displayLang}`, movies: countryCrime, isTV: false },
            { title: `${displayCountry} Comedy Movies${displayLang}`, movies: countryComedy, isTV: false },
            { title: `${displayCountry} Family Movies${displayLang}`, movies: countryFamily, isTV: false },
            { title: `${displayCountry} Fantasy Series${displayLang}`, movies: seriesFantasy, isTV: true },
            { title: `Top Rated ${displayCountry} Movies${displayLang}`, movies: topRated, isTV: false },
          ];

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

  const themeBackgroundMap = {
    default: 'bg-[#141414]',
    ocean: 'bg-linear-to-br from-[#030712] via-[#0f172a] to-[#082f49]',
    sunset: 'bg-linear-to-br from-[#1f0a0a] via-[#3b0827] to-[#451a03]'
  };

  const backgroundFxClass = backgroundFx === 'aurora'
    ? 'theme-fx-aurora'
    : backgroundFx === 'particles'
      ? 'theme-fx-particles'
      : backgroundFx === 'pulse'
        ? 'theme-fx-pulse'
        : '';

  // ===== NOW WE CAN DO CONDITIONAL RENDERING =====

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 font-bold uppercase tracking-widest text-xs">Loading CineMatch...</p>
        </div>
      </div>
    );
  }

  // Content loading state (after auth)
  if (isAuthenticated && contentLoading && !error) {
    return (
      <div className="min-h-screen bg-[#141414] text-white">
        <Navbar 
          onSearch={handleSearch}
          onHome={resetToHome}
          onSmartFinder={() => setShowSmartFinder(true)} 
          onPreferenceSearch={handlePreferenceSearch}
          onCompare={() => setShowCompare(true)}
          onSurpriseMe={handleSurpriseMe}
          onMyList={() => setShowMyList(true)}
          onSettings={() => openSettingsTab('preferences')}
          onPreferences={() => openSettingsTab('preferences')}
          onTheme={() => openSettingsTab('theme')}
          onAccount={() => openSettingsTab('account')}
          onChat={() => openChat()}
          onManageProfile={() => setShowManageProfile(true)}
          selectedCountry={selectedCountry}
          onCountryChange={handleCountryChange}
          browseType={browseType}
          onBrowseTypeChange={setBrowseType}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          currentUser={currentUser}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationsOpen={markAllNotificationsRead}
        />
        <div className="flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-300 font-bold uppercase tracking-widest text-xl animate-pulse">Loading Movies...</p>
            <p className="text-gray-500 text-sm">Fetching content from TMDB</p>
          </div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated and not showing auth
  if (!isAuthenticated && !showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  // Show auth page if not authenticated and showing auth
  if (!isAuthenticated && showAuth) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // ===== HELPER FUNCTIONS & CONSTANTS =====

  // ===== MAIN COMPONENT RENDER =====


  return (
    <div className={`min-h-screen text-white selection:bg-red-600 selection:text-white relative overflow-hidden ${themeBackgroundMap[themeMode] || themeBackgroundMap.default}`}>
      {backgroundFxClass && <div className={`fixed inset-0 pointer-events-none z-0 ${backgroundFxClass}`} />}
      <div className="relative z-10">
      <Navbar 
        onSearch={handleSearch}
        onHome={resetToHome}
        onSmartFinder={() => setShowSmartFinder(true)} 
        onPreferenceSearch={handlePreferenceSearch}
        onCompare={() => setShowCompare(true)}
        onSurpriseMe={handleSurpriseMe}
        onMyList={() => setShowMyList(true)}
        onSettings={() => openSettingsTab('preferences')}
        onPreferences={() => openSettingsTab('preferences')}
        onTheme={() => openSettingsTab('theme')}
        onAccount={() => openSettingsTab('account')}
        onChat={() => openChat()}
        onManageProfile={() => setShowManageProfile(true)}
        selectedCountry={selectedCountry}
        onCountryChange={handleCountryChange}
        browseType={browseType}
        onBrowseTypeChange={setBrowseType}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onNotificationsOpen={markAllNotificationsRead}
      />
      
      {/* Age Verification Modal */}
      {showAgeWarning && isAuthenticated && (
        <AgeVerification 
          onConfirm={handleAgeVerification}
          onDismiss={() => handleAgeVerification(false)}
        />
      )}
      
      <main className="pb-20">
        {error ? (
          <div className="pt-52 md:pt-40 px-4 text-center space-y-6">
            <div className="text-8xl mb-4">🎬</div>
            <h2 className="text-4xl font-black text-red-600 uppercase tracking-tighter">Connection Issue</h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">{error}</p>
            <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 max-w-xl mx-auto text-left space-y-4">
              <p className="text-white font-bold">Possible solutions:</p>
              <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>Check your internet connection</li>
                <li>Disable VPN if you're using one</li>
                <li>Click the retry button below</li>
                <li>Check if your firewall is blocking api.themoviedb.org</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all shadow-lg"
            >
              Retry Connection
            </button>
          </div>
        ) : searchResults ? (
          <div className="pt-44 md:pt-24 px-4 md:px-12 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {isSearching ? 'Searching...' : (searchResults.results.length > 0 ? `Search results for: ${searchResults.query}` : `No results for: ${searchResults.query}`)}
              </h2>
              <button 
                onClick={() => setSearchResults(null)}
                className="text-red-600 font-bold uppercase tracking-widest hover:underline"
              >
                Clear Results
              </button>
            </div>
            
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Searching the cinematic universe...</p>
              </div>
            ) : searchError ? (
              <div className="bg-red-600/10 border border-red-600/20 p-12 rounded-2xl text-center space-y-4">
                <h3 className="text-xl font-black text-red-600 uppercase tracking-tighter">Search Error</h3>
                <p className="text-gray-400">{searchError}</p>
                <button 
                  onClick={() => handleSearch(searchResults?.query?.split(' (')[0] || '')}
                  className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            ) : searchResults.results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {searchResults.results.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onClick={handleMovieClick} isTV={movie.media_type === 'tv'} onToggleList={toggleMyList} isInList={myList?.some(m => m.id === movie.id)} />
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                <div className="bg-white/5 border border-white/10 p-12 rounded-2xl text-center space-y-4">
                  <p className="text-gray-400 text-lg italic">"We couldn't find exactly what you were looking for, but you might like these popular titles instead."</p>
                </div>
                <MovieRow title="Trending Recommendations" movies={trending} onMovieClick={handleMovieClick} onToggleList={toggleMyList} myList={myList} />
                <MovieRow title="Top Rated Recommendations" movies={topRated} onMovieClick={handleMovieClick} onToggleList={toggleMyList} myList={myList} />
              </div>
            )}
          </div>
        ) : (
          <>
            <Hero 
              movie={heroMovie} 
              onInfoClick={handleMovieClick} 
              onToggleList={toggleMyList}
              isInList={myList?.some(m => m.id === heroMovie?.id)}
              pool={heroPool}
              currentIndex={heroIndex}
              contextLabel={browseTypeLabel}
              contextDescription={browseType === 'movie'
                ? `Focused on ${displayCountry} movies${displayLang}`
                : browseType === 'series'
                  ? `Focused on ${displayCountry} series${displayLang}`
                  : browseType === 'drama'
                    ? `Focused on drama picks in ${displayCountry}${displayLang}`
                    : `Mixed picks across movies and series in ${displayCountry}${displayLang}`}
              onIndexChange={(idx) => {
                setHeroIndex(idx);
                setHeroMovie(heroPool[idx]);
              }}
            />
            
            <div className="-mt-20 relative z-30 space-y-12">
              {browseType !== 'all' && (
                <div className="px-4 md:px-12 pt-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/8 border border-white/10 rounded-full text-sm font-bold uppercase tracking-widest text-gray-200 backdrop-blur-sm">
                    Browsing: {browseTypeLabel}
                  </div>
                </div>
              )}

              {homeSections.map((section) => (
                <MovieRow
                  key={section.title}
                  title={section.title}
                  movies={section.movies}
                  onMovieClick={handleMovieClick}
                  isTV={section.isTV}
                  onToggleList={toggleMyList}
                  myList={myList}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <AnimatePresence mode="wait">
        {selectedMovie && (
          <Suspense fallback={<OverlayFallback />}>
            <MovieDetail 
              key="movie-detail"
              movie={selectedMovie} 
              isTV={isTV}
              onClose={() => setSelectedMovie(null)} 
            />
          </Suspense>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {showSmartFinder && (
          <Suspense fallback={<OverlayFallback />}>
            <SmartFinder 
              key="smart-finder"
              onClose={() => setShowSmartFinder(false)} 
              onMovieClick={handleMovieClick}
              onToggleList={toggleMyList}
              onPreferenceSearch={handlePreferenceSearch}
              onNoResultsToChat={handleSmartFinderNoResults}
              myList={myList}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showCompare && (
          <Suspense fallback={<OverlayFallback />}>
            <CompareMovies 
              key="compare-movies"
              onClose={() => setShowCompare(false)} 
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showMyList && (
          <Suspense fallback={<OverlayFallback />}>
            <MyList 
              key="my-list"
              list={myList} 
              onRemove={removeFromList} 
              onMovieClick={handleMovieClick}
              onClose={() => setShowMyList(false)} 
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showSettings && (
          <Suspense fallback={<OverlayFallback />}>
            <Settings 
              key="settings"
              initialTab={settingsTab}
              onTabChange={setSettingsTab}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              backgroundFx={backgroundFx}
              onBackgroundFxChange={setBackgroundFx}
              familySafeMode={familySafeMode}
              onFamilySafeModeChange={setFamilySafeMode}
              currentUser={currentUser}
              onRunPreferenceSearch={handlePreferenceSearch}
              onClose={() => setShowSettings(false)} 
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showChat && (
          <Suspense fallback={<OverlayFallback />}>
            <CineChat 
              key="cine-chat"
              onClose={() => setShowChat(false)} 
              onMovieClick={handleMovieClick}
              familySafeMode={familySafeMode}
              initialAssistantMessage={chatSeedMessage}
            />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showManageProfile && (
          <Suspense fallback={<OverlayFallback />}>
            <ManageProfile 
              key="manage-profile"
              currentUser={currentUser}
              onClose={() => setShowManageProfile(false)} 
            />
          </Suspense>
        )}
      </AnimatePresence>

      {/* Info Page Modals */}
      <AnimatePresence mode="wait">
        {infoPage === 'privacy' && (
          <Suspense fallback={<OverlayFallback />}>
            <PrivacyPolicy onClose={() => setInfoPage(null)} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {infoPage === 'terms' && (
          <Suspense fallback={<OverlayFallback />}>
            <TermsOfService onClose={() => setInfoPage(null)} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {infoPage === 'about' && (
          <Suspense fallback={<OverlayFallback />}>
            <AboutPage onClose={() => setInfoPage(null)} />
          </Suspense>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {infoPage === 'contact' && (
          <Suspense fallback={<OverlayFallback />}>
            <ContactPage onClose={() => setInfoPage(null)} />
          </Suspense>
        )}
      </AnimatePresence>

      <footer className="mt-16 border-t border-white/10 bg-linear-to-b from-[#0f0f10] to-[#080809] px-4 py-12 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-4 md:col-span-1">
              <img src="/logo.png" alt="CineMatch logo" className="h-14 w-14 rounded-2xl object-cover shadow-lg shadow-black/40" />
              <p className="max-w-xs text-sm leading-6 text-gray-400">
                Discover, compare, and curate your next watch with a cinematic experience built for modern audiences.
              </p>
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/shubham_rao_2004/' },
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/shubhamyadav20/' },
                  { icon: Github, label: 'GitHub', href: 'https://github.com/shubham12112004' },
                ].map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-gray-300 transition-all hover:border-red-500/60 hover:text-red-300"
                  >
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button type="button" onClick={() => setInfoPage('about')} className="hover:text-white cursor-pointer">About CineMatch</button></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Press & Media</a></li>
                <li><button type="button" onClick={() => setInfoPage('contact')} className="hover:text-white cursor-pointer">Contact</button></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button type="button" onClick={() => setShowSmartFinder(true)} className="hover:text-white cursor-pointer">Smart Finder</button></li>
                <li><button type="button" onClick={() => setShowCompare(true)} className="hover:text-white cursor-pointer">Compare Titles</button></li>
                <li><button type="button" onClick={() => openChat()} className="hover:text-white cursor-pointer">AI CineChat</button></li>
                <li><button type="button" onClick={() => setShowMyList(true)} className="hover:text-white cursor-pointer">My Watchlist</button></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-gray-200">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><button type="button" onClick={() => setInfoPage('privacy')} className="hover:text-white cursor-pointer">Privacy Policy</button></li>
                <li><button type="button" onClick={() => setInfoPage('terms')} className="hover:text-white cursor-pointer">Terms of Service</button></li>
                <li><a href="#" className="hover:text-white">Cookie Preferences</a></li>
                <li><a href="#" className="hover:text-white">Accessibility</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 CineMatch, Inc. All rights reserved.</p>
            <p>Powered by TMDB data and AI-assisted discovery.</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

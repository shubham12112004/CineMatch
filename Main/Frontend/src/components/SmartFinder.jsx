import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Search,
  Sparkles,
  Mic,
  MicOff,
  WandSparkles,
  Clock3,
  Flame,
  History,
  Stars,
  SlidersHorizontal,
  RefreshCw,
  Play,
  Film,
  Tv,
  Star,
  ArrowRight,
  TrendingUp,
  Brain,
  BadgeInfo,
  Heart,
  ThumbsUp,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  GENRE_MAP,
  MOOD_GENRES,
  POSTER_BASE_URL,
  discoverContent,
  discoverTV,
  fetchFromTMDB,
  getMovieCredits,
  getPersonCombinedCredits,
  getPopularPeople,
  getTVDetails,
  getTVCredits,
  searchPerson,
} from '../services/tmdb';
import MovieCard from './MovieCard';

const PLACEHOLDERS = [
  'What do you want to watch tonight?',
  'Describe your perfect movie mood...',
  'Search by vibe, actor, genre, or feeling...',
  'Funny action movie with a good ending',
  'Dark thriller like Fight Club',
];

const QUICK_PROMPTS = [
  { label: 'Tonight\'s Picks', prompt: 'Tonight\'s picks with a good ending', tone: 'from-red-500/20 to-orange-400/10' },
  { label: 'Weekend Binge', prompt: 'Best crime series under 2 seasons', tone: 'from-cyan-500/20 to-blue-400/10' },
  { label: 'Hidden Gems', prompt: 'Hidden gem movies with high ratings', tone: 'from-violet-500/20 to-fuchsia-400/10' },
  { label: 'Feel Good', prompt: 'Feel good family movies', tone: 'from-emerald-500/20 to-lime-400/10' },
  { label: 'Mind-Bending Sci-Fi', prompt: 'Mind-bending sci-fi movies', tone: 'from-indigo-500/20 to-sky-400/10' },
  { label: 'Underrated Masterpieces', prompt: 'Underrated masterpieces that deserve attention', tone: 'from-amber-500/20 to-yellow-400/10' },
];

const TRENDING_MOODS = [
  { label: 'Cozy Night', prompt: 'cozy feel good movies', icon: Heart },
  { label: 'Big Laughs', prompt: 'funny action movie with good ending', icon: ThumbsUp },
  { label: 'Edge of Seat', prompt: 'dark thriller like Fight Club', icon: Flame },
  { label: 'Smart Sci-Fi', prompt: 'emotional sci-fi movies', icon: Brain },
  { label: 'Family Dinner', prompt: 'family movie for dinner', icon: BadgeInfo },
];

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Any language' },
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'tr', label: 'Turkish' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'Series' },
];

const SORT_OPTIONS = [
  { value: 'smart', label: 'Smart Mix' },
  { value: 'popular', label: 'Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'hidden', label: 'Hidden Gems' },
];

const DEFAULT_ADVANCED = {
  type: 'all',
  sort: 'smart',
  language: '',
  minRating: 0,
  maxRuntime: '',
  maxSeasons: '',
};

const RECENT_SEARCH_STORAGE_KEY = 'cinematch_smart_finder_recent';

const GENRE_KEYWORDS = [
  { keyword: 'action', genreId: 28, label: 'Action' },
  { keyword: 'adventure', genreId: 12, label: 'Adventure' },
  { keyword: 'animation', genreId: 16, label: 'Animation' },
  { keyword: 'anime', genreId: 16, label: 'Anime' },
  { keyword: 'comedy', genreId: 35, label: 'Comedy' },
  { keyword: 'crime', genreId: 80, label: 'Crime' },
  { keyword: 'drama', genreId: 18, label: 'Drama' },
  { keyword: 'family', genreId: 10751, label: 'Family' },
  { keyword: 'fantasy', genreId: 14, label: 'Fantasy' },
  { keyword: 'horror', genreId: 27, label: 'Horror' },
  { keyword: 'mystery', genreId: 9648, label: 'Mystery' },
  { keyword: 'romance', genreId: 10749, label: 'Romance' },
  { keyword: 'romantic', genreId: 10749, label: 'Romantic' },
  { keyword: 'science fiction', genreId: 878, label: 'Sci-Fi' },
  { keyword: 'sci-fi', genreId: 878, label: 'Sci-Fi' },
  { keyword: 'thriller', genreId: 53, label: 'Thriller' },
  { keyword: 'documentary', genreId: 99, label: 'Documentary' },
];

const MOOD_KEYWORDS = [
  { keyword: 'funny', genreId: 35, label: 'Funny' },
  { keyword: 'laugh', genreId: 35, label: 'Comedy' },
  { keyword: 'happy', genreId: 35, label: 'Happy' },
  { keyword: 'feel good', genreId: 35, label: 'Feel-good' },
  { keyword: 'emotional', genreId: 18, label: 'Emotional' },
  { keyword: 'sad', genreId: 18, label: 'Emotional' },
  { keyword: 'dark', genreId: 53, label: 'Dark' },
  { keyword: 'scary', genreId: 27, label: 'Scary' },
  { keyword: 'relax', genreId: 10751, label: 'Relaxing' },
  { keyword: 'inspiring', genreId: 36, label: 'Inspiring' },
  { keyword: 'mind bending', genreId: 878, label: 'Mind-bending' },
  { keyword: 'mind-bending', genreId: 878, label: 'Mind-bending' },
];

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeQuery(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function uniqueById(items) {
  const seen = new Set();
  return (items || []).filter((item) => {
    const key = `${item?.media_type || item?.type || 'movie'}-${item?.id}`;
    if (!item?.id || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractNumber(text) {
  const match = text.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function extractTitleSeed(query) {
  const likeMatch = query.match(/(?:like|similar to|similar as|similar with|in the style of)\s+(.+)$/i);
  if (likeMatch?.[1]) return normalizeQuery(likeMatch[1].replace(/[?.!,]$/g, ''));

  const quoteMatch = query.match(/["“](.+?)["”]/);
  if (quoteMatch?.[1]) return normalizeQuery(quoteMatch[1]);

  return '';
}

function parseIntent(query) {
  const normalized = normalizeQuery(query);
  const lowered = normalized.toLowerCase();
  const intent = {
    query: normalized,
    seedTitle: extractTitleSeed(normalized),
    mediaType: 'all',
    genres: [],
    moodTags: [],
    actorName: '',
    ratingMin: 0,
    language: '',
    sort: 'smart',
    maxRuntime: '',
    maxSeasons: '',
    releaseWindow: '',
    predictions: [],
  };

  if (/\b(series|show|shows|tv|tv show|tv series|season|seasons|episodes?)\b/.test(lowered)) {
    intent.mediaType = 'tv';
  }

  if (/\b(movie|movies|film|films|cinema)\b/.test(lowered)) {
    intent.mediaType = 'movie';
  }

  const seasonMatch = lowered.match(/(?:under|below|less than|up to|max(?:imum)?)\s*(\d+)\s*(?:season|seasons)/);
  if (seasonMatch) {
    intent.mediaType = 'tv';
    intent.maxSeasons = Number(seasonMatch[1]);
  }

  const runtimeMatch = lowered.match(/(?:under|below|less than|up to|max(?:imum)?)\s*(\d+)\s*(?:minutes?|mins?|min|hours?|hrs?|hr)/);
  if (runtimeMatch) {
    const value = Number(runtimeMatch[1]);
    intent.maxRuntime = /hour|hr/.test(runtimeMatch[0]) ? value * 60 : value;
  }

  if (/\b(short|quick|snackable)\b/.test(lowered)) intent.maxRuntime = intent.maxRuntime || 90;
  if (/\b(long|epic|marathon)\b/.test(lowered)) intent.maxRuntime = intent.maxRuntime || 180;

  if (/\b(top rated|best|highest rated|masterpiece|must watch|great ending)\b/.test(lowered)) {
    intent.sort = 'rating';
    intent.ratingMin = Math.max(intent.ratingMin, 7.2);
  }

  if (/\b(popular|trending|everyone is watching|big hit)\b/.test(lowered)) {
    intent.sort = 'popular';
  }

  if (/\b(hidden gem|underrated|underseen|sleeper)\b/.test(lowered)) {
    intent.sort = 'hidden';
    intent.ratingMin = Math.max(intent.ratingMin, 7.0);
  }

  if (/\b(good ending|happy ending|feel good|uplifting|lighthearted)\b/.test(lowered)) {
    intent.moodTags.push('uplifting');
    intent.ratingMin = Math.max(intent.ratingMin, 6.5);
  }

  if (/\b(english)\b/.test(lowered)) intent.language = 'en';
  if (/\b(hindi|bollywood)\b/.test(lowered)) intent.language = 'hi';
  if (/\b(spanish)\b/.test(lowered)) intent.language = 'es';
  if (/\b(french)\b/.test(lowered)) intent.language = 'fr';
  if (/\b(german)\b/.test(lowered)) intent.language = 'de';
  if (/\b(japanese|anime)\b/.test(lowered)) intent.language = 'ja';
  if (/\b(korean)\b/.test(lowered)) intent.language = 'ko';
  if (/\b(turkish)\b/.test(lowered)) intent.language = 'tr';

  if (/\b(90s|1990s)\b/.test(lowered)) intent.releaseWindow = '1990s';
  if (/\b(2000s|2000-2010)\b/.test(lowered)) intent.releaseWindow = '2000s';
  if (/\b(classic|old school|old movie|old show)\b/.test(lowered)) intent.releaseWindow = 'classic';
  if (/\b(modern|recent|new|latest)\b/.test(lowered)) intent.releaseWindow = 'modern';

  GENRE_KEYWORDS.forEach((entry) => {
    if (lowered.includes(entry.keyword)) {
      intent.genres.push({ id: entry.genreId, label: entry.label });
    }
  });

  MOOD_KEYWORDS.forEach((entry) => {
    if (lowered.includes(entry.keyword)) {
      intent.genres.push({ id: entry.genreId, label: entry.label });
      intent.moodTags.push(entry.label);
    }
  });

  const actorPatterns = [
    /(?:with|starring|featuring|actor|actress)\s+([A-Z][\p{L}.'-]+(?:\s+[A-Z][\p{L}.'-]+){0,3})/u,
    /(?:movie|series)\s+with\s+([A-Z][\p{L}.'-]+(?:\s+[A-Z][\p{L}.'-]+){0,3})/u,
  ];
  for (const pattern of actorPatterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) {
      intent.actorName = normalizeQuery(match[1]);
      break;
    }
  }

  if (intent.mediaType === 'all' && (intent.genres.some((g) => g.id === 80 || g.id === 53) || /\b(thriller|crime|mystery)\b/.test(lowered))) {
    intent.mediaType = lowered.includes('series') ? 'tv' : 'all';
  }

  if (!intent.maxRuntime && /\b(fast|short|quick)\b/.test(lowered)) {
    intent.maxRuntime = 100;
  }

  intent.predictions = buildPredictionChips(intent);
  return intent;
}

function buildPredictionChips(intent) {
  const chips = [];

  if (intent.seedTitle) chips.push(`Similar to ${intent.seedTitle}`);
  if (intent.moodTags[0]) chips.push(intent.moodTags[0]);
  if (intent.genres[0]?.label) chips.push(intent.genres[0].label);
  if (intent.actorName) chips.push(`With ${intent.actorName}`);
  if (intent.maxSeasons) chips.push(`Under ${intent.maxSeasons} seasons`);
  if (intent.maxRuntime) chips.push(`Under ${intent.maxRuntime} min`);
  if (intent.sort === 'hidden') chips.push('Hidden gems');
  if (intent.sort === 'rating') chips.push('Top rated');

  return [...new Set(chips)].slice(0, 4);
}

function formatRuntime(runtime) {
  if (!runtime) return '';
  if (runtime < 60) return `${runtime}m`;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes ? `${minutes}m` : ''}`.trim();
}

function getGenreLabels(ids = []) {
  return ids.map((id) => GENRE_MAP[id]).filter(Boolean).slice(0, 3);
}

function makeRecentSearchItems(raw) {
  const normalized = normalizeQuery(raw);
  if (!normalized) return [];

  const existing = safeParseJson(localStorage.getItem(RECENT_SEARCH_STORAGE_KEY), []);
  const next = [normalized, ...existing.filter((item) => item !== normalized)].slice(0, 6);
  localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function buildPreferencePrompt(myList) {
  const genreCounts = new Map();

  (myList || []).forEach((item) => {
    (item.genre_ids || []).forEach((genreId) => {
      genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1);
    });
  });

  const favorites = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => GENRE_MAP[genreId])
    .filter(Boolean);

  if (!favorites.length) return 'Recommend something I will love tonight';
  return `Because I watched ${favorites.join(', ')}, recommend my next pick`;
}

function buildSummaryLabel(intent) {
  const parts = [];
  if (intent.mediaType === 'movie') parts.push('movies only');
  if (intent.mediaType === 'tv') parts.push('series only');
  if (intent.genres[0]?.label) parts.push(intent.genres[0].label);
  if (intent.moodTags[0]) parts.push(intent.moodTags[0]);
  if (intent.actorName) parts.push(`with ${intent.actorName}`);
  if (intent.maxSeasons) parts.push(`under ${intent.maxSeasons} seasons`);
  if (intent.maxRuntime) parts.push(`under ${intent.maxRuntime} min`);
  if (intent.language) parts.push(intent.language.toUpperCase());
  return parts.length ? parts.join(' • ') : 'Smart match';
}

export default function SmartFinder({ onClose, onMovieClick, onToggleList, myList, onPreferenceSearch, onNoResultsToChat }) {
  const [query, setQuery] = useState('');
  const [assistantLine, setAssistantLine] = useState('Tell me the vibe and I will narrow it down instantly.');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [intentPreview, setIntentPreview] = useState(null);
  const [quickType, setQuickType] = useState('all');
  const [advanced, setAdvanced] = useState(DEFAULT_ADVANCED);
  const [popularActors, setPopularActors] = useState([]);
  const [heroRecommendations, setHeroRecommendations] = useState([]);
  const [becauseYouWatched, setBecauseYouWatched] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const requestIdRef = useRef(0);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const placeholder = PLACEHOLDERS[placeholderIndex % PLACEHOLDERS.length];

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => prev + 1);
    }, 2800);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setRecentSearches(safeParseJson(localStorage.getItem(RECENT_SEARCH_STORAGE_KEY), []));
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setQuery(transcript);
      setIsListening(false);
      textareaRef.current?.focus();
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch {
        // Ignore cleanup failures.
      }
    };
  }, []);

  useEffect(() => {
    const parsed = parseIntent(query);
    setIntentPreview(parsed);
    setPredictions(parsed.predictions);
    setAdvanced((prev) => ({
      ...prev,
      type: parsed.mediaType === 'all' ? prev.type : parsed.mediaType,
    }));
  }, [query]);

  useEffect(() => {
    const debounce = setTimeout(async () => {
      const normalized = normalizeQuery(query);
      if (normalized.length < 2) {
        setHeroRecommendations([]);
        return;
      }

      try {
        const data = await fetchFromTMDB('search/multi', {
          query: normalized,
          include_adult: false,
        });

        const items = uniqueById((data.results || []).filter((item) => item.media_type === 'movie' || item.media_type === 'tv'));
        setHeroRecommendations(items.slice(0, 5));
      } catch {
        setHeroRecommendations([]);
      }
    }, 260);

    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    const buildCollections = async () => {
      try {
        const [trendingMovies, trendingSeries] = await Promise.all([
          discoverContent({ sort_by: 'popularity.desc', include_adult: false }),
          discoverTV({ sort_by: 'popularity.desc', include_adult: false }),
        ]);

        setFeaturedCollections([
          {
            title: 'Tonight\'s Picks',
            subtitle: 'Balanced, high-retention recommendations for the evening.',
            prompt: 'Tonight\'s picks with a good ending',
            items: uniqueById([...(trendingMovies.results || []), ...(trendingSeries.results || [])]).slice(0, 6),
          },
          {
            title: 'Weekend Binge',
            subtitle: 'Series that reward longer sessions without friction.',
            prompt: 'Best crime series under 2 seasons',
            items: uniqueById(trendingSeries.results || []).slice(0, 6),
          },
          {
            title: 'Hidden Gems',
            subtitle: 'Under-the-radar titles with strong audience response.',
            prompt: 'Hidden gem movies with high ratings',
            items: uniqueById(trendingMovies.results || []).slice(0, 6),
          },
        ]);
      } catch {
        setFeaturedCollections([]);
      }
    };

    buildCollections();
  }, []);

  useEffect(() => {
    const buildBecauseYouWatched = async () => {
      if (!myList?.length) {
        setBecauseYouWatched([]);
        return;
      }

      const genreCounts = new Map();
      (myList || []).forEach((item) => {
        (item.genre_ids || []).forEach((genreId) => {
          genreCounts.set(genreId, (genreCounts.get(genreId) || 0) + 1);
        });
      });

      const favoriteGenres = [...genreCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([genreId]) => genreId);

      if (!favoriteGenres.length) {
        setBecauseYouWatched([]);
        return;
      }

      try {
        const [movies, tv] = await Promise.all([
          discoverContent({ with_genres: favoriteGenres.join(','), sort_by: 'vote_average.desc', 'vote_count.gte': 200, include_adult: false }),
          discoverTV({ with_genres: favoriteGenres.join(','), sort_by: 'vote_average.desc', 'vote_count.gte': 200, include_adult: false }),
        ]);

        setBecauseYouWatched(uniqueById([...(movies.results || []), ...(tv.results || [])]).slice(0, 6));
      } catch {
        setBecauseYouWatched([]);
      }
    };

    buildBecauseYouWatched();
  }, [myList]);

  useEffect(() => {
    const loadPopularActors = async () => {
      try {
        const [page1, page2] = await Promise.all([getPopularPeople(1), getPopularPeople(2)]);
        const merged = [...(page1?.results || []), ...(page2?.results || [])]
          .filter((person) => person?.id && person?.name)
          .slice(0, 10);
        setPopularActors(merged);
      } catch {
        setPopularActors([]);
      }
    };

    loadPopularActors();
  }, []);

  const saveRecentSearch = (value) => {
    const next = makeRecentSearchItems(value);
    setRecentSearches(next);
  };

  const startVoiceSearch = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setAssistantLine('Voice search is not supported in this browser.');
      return;
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const inferPersonId = async (actorName) => {
    if (!actorName) return null;

    const data = await searchPerson(actorName);
    const candidate = (data?.results || []).find((person) => person?.id);
    return candidate || null;
  };

  const fetchRecommendationsForSeed = async (seedItem) => {
    if (!seedItem?.id || !seedItem?.media_type) return [];

    try {
      const data = await fetchFromTMDB(`${seedItem.media_type}/${seedItem.id}/recommendations`, {
        include_adult: false,
      });
      return (data.results || []).map((item) => ({ ...item, media_type: seedItem.media_type }));
    } catch {
      return [];
    }
  };

  const enrichTVSeasons = async (items, maxSeasons) => {
    if (!maxSeasons) return items;

    const sample = items.slice(0, 20);
    const detailed = await Promise.all(sample.map(async (item) => {
      try {
        const detail = await getTVDetails(item.id);
        return { ...item, number_of_seasons: detail?.number_of_seasons ?? item.number_of_seasons };
      } catch {
        return item;
      }
    }));

    return detailed.filter((item) => Number(item.number_of_seasons || 0) <= Number(maxSeasons));
  };

  const buildParams = (intent, mediaType) => {
    const params = {
      include_adult: false,
      sort_by: 'popularity.desc',
      'vote_average.gte': intent.ratingMin || (intent.sort === 'rating' ? 7.2 : 0),
    };

    if (intent.sort === 'rating') params.sort_by = 'vote_average.desc';
    if (intent.sort === 'popular') params.sort_by = 'popularity.desc';
    if (intent.sort === 'hidden') {
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 80;
    }

    const genreIds = intent.genres.map((item) => item.id).filter(Boolean);
    if (genreIds.length) params.with_genres = [...new Set(genreIds)].join(',');

    if (intent.language) params.with_original_language = intent.language;

    if (intent.maxRuntime && mediaType === 'movie') {
      params['with_runtime.lte'] = intent.maxRuntime;
    }

    if (intent.releaseWindow === 'classic') {
      params.primary_release_date_lte = '1999-12-31';
      params.first_air_date_lte = '1999-12-31';
    } else if (intent.releaseWindow === 'modern') {
      params.primary_release_date_gte = '2000-01-01';
      params.first_air_date_gte = '2000-01-01';
    }

    return params;
  };

  const scoreWithContext = (items, intent) => {
    const targetGenres = new Set(intent.genres.map((item) => item.id));
    return items
      .map((item) => {
        const itemGenres = new Set(item.genre_ids || []);
        const sharedGenres = [...targetGenres].filter((genreId) => itemGenres.has(genreId)).length;
        const rating = Number(item.vote_average || 0);
        const popularity = Number(item.popularity || 0);
        const title = `${item.title || item.name || ''} ${item.overview || ''}`.toLowerCase();

        let score = popularity / 100 + rating * 1.8 + sharedGenres * 2.5;

        if (intent.seedTitle) {
          const seedParts = intent.seedTitle.toLowerCase().split(/\s+/);
          if (seedParts.some((part) => part.length > 2 && title.includes(part))) score += 4;
        }

        if (intent.actorName && item.title) score += 0.15;
        if (intent.sort === 'hidden') score += Math.max(0, 8 - Math.min(item.popularity || 0, 8)) / 2;

        return { ...item, _score: score };
      })
      .sort((a, b) => (b._score || 0) - (a._score || 0));
  };

  const runSearch = async (searchValue = query, options = {}) => {
    const text = normalizeQuery(searchValue || options.prompt || '');
    if (!text) {
      setAssistantLine('Type a vibe, an actor, or a title and I will do the rest.');
      return;
    }

    const intent = parseIntent(text);
    const activeType = options.type || advanced.type || intent.mediaType || 'all';
    const activeSort = options.sort || advanced.sort || intent.sort;
    const activeLanguage = options.language ?? advanced.language ?? intent.language;
    const activeRuntime = options.maxRuntime ?? advanced.maxRuntime ?? intent.maxRuntime;
    const activeSeasons = options.maxSeasons ?? advanced.maxSeasons ?? intent.maxSeasons;
    const activeMinRating = options.minRating ?? advanced.minRating ?? intent.ratingMin ?? 0;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setResults([]);
    setAssistantLine('Thinking through the vibe...');

    try {
      saveRecentSearch(text);

      const searchSeed = intent.seedTitle || (text.length < 24 ? text : '');
      const shouldUseSeed = Boolean(searchSeed) && !/\b(movie|series|show|tv)\b/i.test(text);
      let seedItem = null;
      let seedRecommendations = [];

      if (shouldUseSeed) {
        const seedData = await fetchFromTMDB('search/multi', { query: searchSeed, include_adult: false });
        seedItem = (seedData?.results || []).find((item) => item.media_type === 'movie' || item.media_type === 'tv') || null;
        seedRecommendations = await fetchRecommendationsForSeed(seedItem);
      }

      let resolvedActor = null;
      if (intent.actorName) {
        try {
          resolvedActor = await inferPersonId(intent.actorName);
        } catch {
          resolvedActor = null;
        }
      }

      const normalizedIntent = {
        ...intent,
        ratingMin: Number(activeMinRating || intent.ratingMin || 0),
        language: activeLanguage || intent.language,
        sort: activeSort,
        maxRuntime: activeRuntime,
        maxSeasons: activeSeasons,
        mediaType: activeType === 'all' ? intent.mediaType : activeType,
      };

      const movieParams = buildParams(normalizedIntent, 'movie');
      const tvParams = buildParams(normalizedIntent, 'tv');

      if (resolvedActor?.id) {
        movieParams.with_cast = resolvedActor.id;
        tvParams.with_people = resolvedActor.id;
      }

      const shouldFetchMovies = normalizedIntent.mediaType !== 'tv';
      const shouldFetchTV = normalizedIntent.mediaType !== 'movie';

      const fetches = [];
      if (shouldFetchMovies) fetches.push(discoverContent(movieParams));
      if (shouldFetchTV) fetches.push(discoverTV(tvParams));

      const [movieData, tvData] = await Promise.all(fetches.length ? fetches : [discoverContent(movieParams)]);

      const movieResults = shouldFetchMovies ? ((movieData?.results || []).map((item) => ({ ...item, media_type: 'movie' }))) : [];
      const tvResults = shouldFetchTV ? ((shouldFetchMovies ? tvData : movieData)?.results || []).map((item) => ({ ...item, media_type: 'tv' })) : [];

      let combined = [...seedRecommendations, ...movieResults, ...tvResults];

      if (normalizedIntent.mediaType === 'tv' && normalizedIntent.maxSeasons) {
        combined = await enrichTVSeasons(combined.filter((item) => item.media_type === 'tv'), normalizedIntent.maxSeasons);
      }

      if (resolvedActor?.id) {
        const personCredits = await getPersonCombinedCredits(resolvedActor.id);
        const allowedIds = new Set((personCredits?.cast || []).map((item) => item.id));
        combined = combined.filter((item) => allowedIds.has(item.id) || item.media_type === 'movie' || item.media_type === 'tv');
      }

      if (normalizedIntent.maxRuntime && normalizedIntent.mediaType !== 'tv') {
        combined = combined.filter((item) => !item.runtime || Number(item.runtime) <= Number(normalizedIntent.maxRuntime));
      }

      if (normalizedIntent.maxSeasons && normalizedIntent.mediaType !== 'movie') {
        combined = combined.filter((item) => item.media_type !== 'tv' || Number(item.number_of_seasons || 0) <= Number(normalizedIntent.maxSeasons));
      }

      if (normalizedIntent.language) {
        combined = combined.filter((item) => !item.original_language || item.original_language === normalizedIntent.language);
      }

      if (Number(normalizedIntent.ratingMin || 0) > 0) {
        combined = combined.filter((item) => Number(item.vote_average || 0) >= Number(normalizedIntent.ratingMin));
      }

      if (normalizedIntent.genres.length) {
        const targetGenres = new Set(normalizedIntent.genres.map((item) => item.id));
        combined = combined.filter((item) => (item.genre_ids || []).some((genreId) => targetGenres.has(genreId)));
      }

      const scored = scoreWithContext(uniqueById(combined), normalizedIntent);
      const finalResults = scored.slice(0, 36);

      if (requestIdRef.current !== requestId) return;

      setResults(finalResults);
      setIntentPreview(normalizedIntent);

      const summary = buildSummaryLabel(normalizedIntent);
      setAssistantLine(finalResults.length
        ? `I found ${finalResults.length} strong matches for ${summary.toLowerCase()}.`
        : `I could not find a clean match for ${summary.toLowerCase()}. Try making the vibe a little broader.`);

      const enrichedActors = resolvedActor?.name ? [resolvedActor, ...(popularActors || []).filter((person) => person.id !== resolvedActor.id)] : popularActors;
      setPopularActors(enrichedActors.slice(0, 10));

      if (!finalResults.length && typeof onNoResultsToChat === 'function') {
        onNoResultsToChat(`I could not find enough strong matches for: "${text}". Help me refine it into a better recommendation.`);
      }
    } catch (error) {
      console.error('Smart finder search failed', error);
      if (requestIdRef.current !== requestId) return;
      setResults([]);
      setAssistantLine('I hit a search limit. Try rewording the vibe or open the assistant chat for a deeper search.');
      if (typeof onNoResultsToChat === 'function') {
        onNoResultsToChat(`I could not search "${text}" right now. Please refine it or ask for a simpler vibe.`);
      }
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const applyPreset = (prompt, type = 'all') => {
    setQuery(prompt);
    setAdvanced((prev) => ({ ...prev, type }));
    runSearch(prompt, { type });
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setPredictions([]);
    setIntentPreview(null);
    setAssistantLine('Tell me the vibe and I will narrow it down instantly.');
    textareaRef.current?.focus();
  };

  const renderSuggestionRail = () => {
    if (!intentPreview && !query.trim()) {
      return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featuredCollections.map((collection) => (
            <motion.button
              key={collection.title}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => applyPreset(collection.prompt)}
              className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/4 p-5 text-left shadow-[0_22px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-all"
            >
              <div className="absolute inset-0 bg-linear-to-br from-white/8 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">AI Playlist</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{collection.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/65">{collection.subtitle}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 p-3 text-white/70">
                  <WandSparkles size={18} />
                </div>
              </div>
              <div className="relative z-10 mt-5 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                <span>One click</span>
                <span className="inline-flex items-center gap-1 text-white/80"><ArrowRight size={12} /> Search</span>
              </div>
            </motion.button>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[1.35rem] border border-white/10 bg-white/4 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-2">
              {(intentPreview?.predictions || predictions || []).map((chip) => (
                <button
                  key={chip}
                  onClick={() => applyPreset(chip)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition-all hover:bg-white/10 hover:text-white"
                >
                  {chip}
                </button>
              ))}
              {!predictions.length && (
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Suggestions will appear as you type</span>
              )}
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-white/4 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-emerald-500/15 p-3 text-emerald-200">
                <Stars size={18} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Assistant readout</p>
                <p className="mt-1 text-sm leading-6 text-white/80">{assistantLine}</p>
              </div>
            </div>
          </div>
        </div>

        {heroRecommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Autocomplete recommendations</p>
              <button
                type="button"
                onClick={() => runSearch(query)}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
              >
                Search all
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {heroRecommendations.map((item) => (
                <button
                  key={`${item.media_type}-${item.id}`}
                  onClick={() => handleMovieClick(item, item.media_type)}
                  className="group overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.25)] transition hover:border-white/20"
                >
                  <div className="aspect-2/3 bg-slate-900">
                    {item.poster_path ? (
                      <img
                        src={`${POSTER_BASE_URL}${item.poster_path}`}
                        alt={item.title || item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 text-white/40">
                        <Film size={28} />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-white">{item.title || item.name}</p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      {item.media_type === 'tv' ? 'Series' : 'Movie'} {item.vote_average ? `• ${item.vote_average.toFixed(1)}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCollections = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {QUICK_PROMPTS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => applyPreset(preset.prompt)}
            className={`group rounded-[1.35rem] border border-white/10 bg-linear-to-br ${preset.tone} p-4 text-left shadow-[0_22px_60px_rgba(0,0,0,0.32)] transition hover:-translate-y-1`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">AI playlist</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{preset.label}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">Instantly loads a cinematic search with one tap.</p>
              </div>
              <div className="rounded-full border border-white/12 bg-black/15 p-3 text-white/80 transition group-hover:bg-white/10">
                <WandSparkles size={18} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/4 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Trending moods</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Search by feeling</h3>
            </div>
            <TrendingUp className="text-white/35" size={18} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TRENDING_MOODS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => applyPreset(item.prompt)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:bg-white/12 hover:text-white"
                >
                  <Icon size={12} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Recent searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    onClick={() => applyPreset(item)}
                    className="rounded-full border border-white/10 bg-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <History className="mr-1 inline-block" size={12} />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/4 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Because you watched</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Next best matches</h3>
            </div>
            <Sparkles className="text-white/35" size={18} />
          </div>

          <div className="mt-4 space-y-3">
            {becauseYouWatched.length > 0 ? becauseYouWatched.slice(0, 4).map((item) => (
              <button
                key={`${item.media_type}-${item.id}`}
                onClick={() => handleMovieClick(item, item.media_type)}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-black/10 p-2 text-left transition hover:bg-white/8"
              >
                <div className="h-14 w-10 overflow-hidden rounded-xl bg-slate-900">
                  {item.poster_path ? (
                    <img src={`${POSTER_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{item.title || item.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                    {getGenreLabels(item.genre_ids).join(' • ') || (item.media_type === 'tv' ? 'Series' : 'Movie')}
                  </p>
                </div>
              </button>
            )) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/10 p-4 text-sm text-white/55">
                Add titles to My List and I will shape recommendations around your taste.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {featuredCollections.map((collection) => (
          <div key={collection.title} className="rounded-[1.4rem] border border-white/10 bg-white/4 p-5 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Playlist</p>
                <h3 className="mt-1 text-lg font-semibold text-white">{collection.title}</h3>
              </div>
              <button
                onClick={() => applyPreset(collection.prompt)}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <Play size={12} />
                Play
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">{collection.subtitle}</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {collection.items.slice(0, 3).map((item) => (
                <button key={`${collection.title}-${item.id}`} onClick={() => handleMovieClick(item, item.media_type || 'movie')} className="overflow-hidden rounded-2xl border border-white/8 bg-black/10">
                  <div className="aspect-2/3">
                    {item.poster_path ? <img src={`${POSTER_BASE_URL}${item.poster_path}`} alt={item.title || item.name} className="h-full w-full object-cover" loading="lazy" /> : null}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 overflow-y-auto bg-black/92 px-4 py-4 backdrop-blur-xl md:px-8 md:py-8"
    >
      <div className="mx-auto flex min-h-full w-full max-w-368 flex-col overflow-hidden rounded-4xl border border-white/10 bg-linear-to-b from-[#0c0c12]/96 via-[#0a0a0f]/94 to-black/96 shadow-[0_40px_120px_rgba(0,0,0,0.78)]">
        <div className="flex flex-col gap-4 border-b border-white/10 bg-white/3 px-5 py-4 md:px-7 md:py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-red-500/30 to-amber-400/20 text-white shadow-[0_0_24px_rgba(239,68,68,0.25)]">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/40">AI-powered discovery</p>
                <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Smart Finder</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/55">
                  Ask naturally. I will infer vibe, genre, actor, runtime, language, and whether you want a movie or a series.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onPreferenceSearch && (
                <button
                  type="button"
                  onClick={() => {
                    onPreferenceSearch();
                    onClose();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-500/18"
                >
                  <Stars size={14} />
                  Saved Preferences
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Close Smart Finder"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                runSearch();
              }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35">
                <Search size={20} />
              </div>
              <input
                ref={textareaRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="h-16 w-full rounded-[1.35rem] border border-white/10 bg-white/6 pl-12 pr-32 text-base text-white outline-none ring-0 placeholder:text-white/30 focus:border-red-400/30 focus:bg-white/8.5"
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-2">
                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${isListening ? 'border-red-400/40 bg-red-500/18 text-red-100' : 'border-white/10 bg-white/6 text-white/70 hover:bg-white/10 hover:text-white'}`}
                  aria-label="Voice search"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition hover:scale-[1.02]"
                >
                  <Search size={14} />
                  Search
                </button>
              </div>
            </form>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 xl:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="inline-flex items-center justify-center gap-2 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75 transition hover:bg-white/9 hover:text-white"
              >
                <SlidersHorizontal size={14} />
                {showAdvanced ? 'Hide Refine' : 'Refine'}
              </button>
              <button
                type="button"
                onClick={clearQuery}
                className="inline-flex items-center justify-center gap-2 rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75 transition hover:bg-white/9 hover:text-white"
              >
                <RefreshCw size={14} />
                Reset
              </button>
            </div>
          </div>

          {intentPreview?.predictions?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">Detected</span>
              {intentPreview.predictions.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  {chip}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {QUICK_PROMPTS.slice(0, 4).map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => applyPreset(chip.prompt)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/74 transition hover:bg-white/10 hover:text-white"
              >
                {chip.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              <Clock3 size={12} />
              Fast natural language search
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden border-b border-white/10 bg-black/20"
            >
              <div className="grid gap-4 px-5 py-5 md:px-7 lg:grid-cols-5">
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Type</p>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setAdvanced((prev) => ({ ...prev, type: option.value }));
                          setQuickType(option.value);
                        }}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${advanced.type === option.value || quickType === option.value ? 'border-white/30 bg-white text-black' : 'border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Sort</p>
                  <div className="flex flex-wrap gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setAdvanced((prev) => ({ ...prev, sort: option.value }))}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${advanced.sort === option.value ? 'border-white/30 bg-white text-black' : 'border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Language</p>
                  <select
                    value={advanced.language}
                    onChange={(event) => setAdvanced((prev) => ({ ...prev, language: event.target.value }))}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                  >
                    {LANGUAGE_OPTIONS.map((option) => (
                      <option key={option.value || 'any'} value={option.value} className="bg-[#111] text-white">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Minimum rating</p>
                  <div className="flex flex-wrap gap-2">
                    {[0, 6, 7, 8].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setAdvanced((prev) => ({ ...prev, minRating: rating }))}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${Number(advanced.minRating) === rating ? 'border-white/30 bg-white text-black' : 'border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white'}`}
                      >
                        {rating === 0 ? 'Any' : `${rating}+`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Runtime</p>
                  <div className="flex flex-wrap gap-2">
                    {['', 90, 120, 150].map((runtime) => (
                      <button
                        key={String(runtime || 'any')}
                        type="button"
                        onClick={() => setAdvanced((prev) => ({ ...prev, maxRuntime: runtime }))}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${String(advanced.maxRuntime || '') === String(runtime || '') ? 'border-white/30 bg-white text-black' : 'border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white'}`}
                      >
                        {runtime ? `Under ${runtime}m` : 'Any'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Series</p>
                  <div className="flex flex-wrap gap-2">
                    {['', 2, 4, 6].map((seasons) => (
                      <button
                        key={String(seasons || 'any')}
                        type="button"
                        onClick={() => setAdvanced((prev) => ({ ...prev, maxSeasons: seasons }))}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${String(advanced.maxSeasons || '') === String(seasons || '') ? 'border-white/30 bg-white text-black' : 'border-white/10 bg-white/4 text-white/70 hover:bg-white/8 hover:text-white'}`}
                      >
                        {seasons ? `Under ${seasons}` : 'Any'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setAdvanced(DEFAULT_ADVANCED)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/80 transition hover:bg-white/9 hover:text-white"
                  >
                    <RefreshCw size={14} />
                    Clear Refine
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 px-5 py-5 md:px-7 md:py-6">
          {loading ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 shadow-[0_0_25px_rgba(255,255,255,0.08)]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">Finding the right vibe</p>
                <p className="mt-1 text-sm text-white/55">I am mapping your prompt into genres, moods, and audience fit.</p>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/40">Results</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-white md:text-3xl">{assistantLine}</h2>
                </div>
                <button
                  onClick={() => runSearch(query)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/75 transition hover:bg-white/9 hover:text-white"
                >
                  <RefreshCw size={14} />
                  Refresh search
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {results.map((item) => (
                  <MovieCard
                    key={`${item.media_type || 'movie'}-${item.id}`}
                    movie={item}
                    onClick={onMovieClick}
                    isTV={item.media_type === 'tv'}
                    onToggleList={onToggleList}
                    isInList={myList?.some((m) => m.id === item.id)}
                  />
                ))}
              </div>
            </div>
          ) : query.trim() ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full border border-white/10 bg-white/5 p-4 text-white/70">
                <Brain size={24} />
              </div>
              <div>
                <p className="text-xl font-semibold text-white">No exact match yet</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                  Try adding a mood, the word movie or series, or a title reference like “like Fight Club”. I can also search by actor, runtime, language, or vibe.
                </p>
              </div>
            </div>
          ) : (
            renderCollections()
          )}
        </div>

        {query.trim() && (
          <div className="border-t border-white/10 bg-white/3 px-5 py-4 md:px-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/35">Suggestions</span>
              {predictions.length > 0 ? predictions.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => applyPreset(chip)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:bg-white/10 hover:text-white"
                >
                  {chip}
                </button>
              )) : (
                <span className="text-sm text-white/50">Try “emotional sci-fi movies”, “family movie for dinner”, or “best crime series under 2 seasons”.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
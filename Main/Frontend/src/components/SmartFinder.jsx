import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Sparkles, Tv, Film, Heart, Clock, Star, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { MOOD_GENRES, POSTER_BASE_URL, discoverContent, discoverTV, getMovieCredits, getPersonCombinedCredits, getPopularPeople, getTVDetails, getTVCredits, searchPerson } from '../services/tmdb';
import MovieCard from './MovieCard';

const MODE_OPTIONS = [
  { key: 'movie', label: 'Movie', icon: Film },
  { key: 'tv', label: 'Series', icon: Tv },
  { key: 'drama', label: 'Drama Picks', icon: Heart },
  { key: 'anime', label: 'Anime Picks', icon: Sparkles },
];

const MOVIE_CATEGORY_OPTIONS = [
  { label: 'Any Movie', genres: [] },
  { label: 'Family Movie', genres: [10751] },
  { label: 'Comedy Movie', genres: [35] },
  { label: 'Romantic Movie', genres: [10749] },
  { label: 'Adventure Movie', genres: [12] },
  { label: 'Animated Movie', genres: [16] },
  { label: 'Thriller Movie', genres: [53] },
  { label: 'Mature Movie', genres: [80, 53] },
];

const SERIES_CATEGORY_OPTIONS = [
  { label: 'Any Series', genres: [] },
  { label: 'Family Show', genres: [10751] },
  { label: 'Comedy Show', genres: [35] },
  { label: 'Crime Show', genres: [80] },
  { label: 'Thriller Show', genres: [53] },
  { label: 'Adventure Show', genres: [12] },
  { label: 'Documentary Series', genres: [99] },
  { label: 'Fantasy Show', genres: [14] },
];

const STORY_FOCUS_OPTIONS = [
  { key: 'any', label: 'Any Focus', keywords: [] },
  { key: 'family', label: 'Family', keywords: ['family', 'parent', 'mother', 'father', 'daughter', 'son', 'siblings'] },
  { key: 'couple', label: 'Couple', keywords: ['couple', 'love', 'romance', 'relationship', 'husband', 'wife', 'lover'] },
  { key: 'solo', label: 'Solo', keywords: ['alone', 'solo', 'loner', 'survivor', 'journey', 'stranded'] },
  { key: 'friends', label: 'Friends', keywords: ['friends', 'friendship', 'buddy', 'group', 'crew', 'gang'] },
  { key: 'pets', label: 'Pets', keywords: ['dog', 'cat', 'pet', 'animal', 'puppy', 'horse'] },
];

const MAIN_GENRES = [
  { id: 28, label: 'Action' },
  { id: 12, label: 'Adventure' },
  { id: 16, label: 'Animation' },
  { id: 35, label: 'Comedy' },
  { id: 80, label: 'Crime' },
  { id: 18, label: 'Drama' },
  { id: 10751, label: 'Family' },
  { id: 14, label: 'Fantasy' },
  { id: 27, label: 'Horror' },
  { id: 9648, label: 'Mystery' },
  { id: 10749, label: 'Romance' },
  { id: 878, label: 'Sci-Fi' },
  { id: 53, label: 'Thriller' },
];

const DURATION_OPTIONS = [
  { key: 'any', label: 'Any Duration' },
  { key: 'short', label: 'Short (<= 45 min)' },
  { key: 'standard', label: 'Standard (46-90 min)' },
  { key: 'long', label: 'Long (91-140 min)' },
  { key: 'epic', label: 'Epic (141+ min)' },
];

const SEASON_OPTIONS = [
  { key: 'any', label: 'Any Seasons' },
  { key: '1-2', label: '1-2 Seasons' },
  { key: '3-5', label: '3-5 Seasons' },
  { key: '6+', label: '6+ Seasons' },
];

const ERA_OPTIONS = [
  { key: 'any', label: 'Any Era' },
  { key: 'classic', label: 'Classic (Before 2000)' },
  { key: 'modern', label: 'Modern (2000-2015)' },
  { key: 'latest', label: 'Latest (2016-Now)' },
];

const LANGUAGE_OPTIONS = [
  { name: 'Any', code: '' },
  { name: 'English', code: 'en' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Korean', code: 'ko' },
  { name: 'Turkish', code: 'tr' },
];

const DEFAULT_FILTERS = {
  mood: '',
  mode: 'movie',
  contentCategory: 'Any Movie',
  storyFocus: 'any',
  selectedGenres: [],
  rating: 6,
  duration: 'any',
  tvStatus: 'any',
  seasonRange: 'any',
  personId: null,
  personName: '',
  language: '',
  era: 'any',
};

export default function SmartFinder({ onClose, onMovieClick, onToggleList, myList, onPreferenceSearch, onNoResultsToChat }) {
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actorQuery, setActorQuery] = useState('');
  const [actorResults, setActorResults] = useState([]);
  const [popularActors, setPopularActors] = useState([]);
  const [relatedActors, setRelatedActors] = useState([]);
  const [actorLoading, setActorLoading] = useState(false);

  const includesTV = useMemo(() => ['tv', 'drama', 'anime'].includes(filters.mode), [filters.mode]);
  const categoryOptions = useMemo(() => {
    if (filters.mode === 'movie') return MOVIE_CATEGORY_OPTIONS;
    return SERIES_CATEGORY_OPTIONS;
  }, [filters.mode]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActorQuery('');
    setActorResults([]);
    setPopularActors([]);
    setRelatedActors([]);
  };

  const nextStep = () => {
    setStep((prev) => {
      let next = prev + 1;
      if (next === 8 && !includesTV) next = 9;
      return next;
    });
  };

  const prevStep = () => {
    setStep((prev) => {
      let next = prev - 1;
      if (prev === 9 && !includesTV) next = 7;
      return Math.max(1, next);
    });
  };

  const normalizePeople = (people) => {
    const seen = new Set();
    return (people || [])
      .filter((person) => person?.id && !seen.has(person.id))
      .filter((person) => !!person?.name)
      .filter((person) => (person.known_for_department || '').toLowerCase() === 'acting' || person.known_for_department === undefined)
      .filter((person) => {
        if (seen.has(person.id)) return false;
        seen.add(person.id);
        return true;
      })
      .sort((a, b) => {
        const hasImageDiff = Number(Boolean(b.profile_path)) - Number(Boolean(a.profile_path));
        if (hasImageDiff !== 0) return hasImageDiff;
        return (b.popularity || 0) - (a.popularity || 0);
      })
      .slice(0, 18);
  };

  const selectActor = (person) => {
    updateFilter('personId', person.id);
    updateFilter('personName', person.name || '');
    setActorQuery(person.name || '');
  };

  const clearActorSelection = () => {
    updateFilter('personId', null);
    updateFilter('personName', '');
    setActorQuery('');
    setRelatedActors([]);
  };

  useEffect(() => {
    if (step !== 9 || actorQuery.trim().length >= 2 || popularActors.length) return;

    let active = true;
    (async () => {
      try {
        const [page1, page2] = await Promise.all([getPopularPeople(1), getPopularPeople(2)]);
        if (!active) return;
        const merged = [...(page1?.results || []), ...(page2?.results || [])];
        setPopularActors(normalizePeople(merged));
      } catch {
        if (!active) return;
        setPopularActors([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [actorQuery, popularActors.length, step]);

  useEffect(() => {
    if (step !== 9) return;

    const query = actorQuery.trim();
    if (query.length < 2) {
      setActorResults([]);
      setActorLoading(false);
      return;
    }

    let active = true;
    setActorLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const data = await searchPerson(query);
        if (!active) return;
        setActorResults(normalizePeople(data?.results));
      } catch {
        if (!active) return;
        setActorResults([]);
      } finally {
        if (active) setActorLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [actorQuery, step]);

  useEffect(() => {
    if (step !== 9 || !filters.personId) {
      setRelatedActors([]);
      return;
    }

    let active = true;

    (async () => {
      try {
        const creditsData = await getPersonCombinedCredits(filters.personId);
        const credits = (creditsData?.cast || [])
          .filter((item) => item?.id && (item.media_type === 'movie' || item.media_type === 'tv'))
          .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
          .slice(0, 6);

        const coActorMap = new Map();
        await Promise.all(
          credits.map(async (credit) => {
            try {
              const castData = credit.media_type === 'tv'
                ? await getTVCredits(credit.id)
                : await getMovieCredits(credit.id);

              (castData?.cast || []).slice(0, 15).forEach((member) => {
                if (!member?.id || member.id === filters.personId || !member?.name) return;
                const existing = coActorMap.get(member.id) || { ...member, score: 0 };
                existing.score += Math.max(1, 15 - (member.order ?? 14));
                coActorMap.set(member.id, existing);
              });
            } catch {
              // Ignore a single credit failure and continue with others.
            }
          })
        );

        if (!active) return;
        const related = Array.from(coActorMap.values())
          .sort((a, b) => {
            const scoreDiff = (b.score || 0) - (a.score || 0);
            if (scoreDiff !== 0) return scoreDiff;
            return (b.popularity || 0) - (a.popularity || 0);
          })
          .filter((person) => person.id !== filters.personId)
          .slice(0, 12);
        setRelatedActors(related);
      } catch {
        if (!active) return;
        setRelatedActors([]);
      }
    })();

    return () => {
      active = false;
    };
  }, [filters.personId, step]);

  const skipCurrentStep = () => {
    if (step === 1) updateFilter('mood', '');
    if (step === 2) {
      updateFilter('mode', 'movie');
      updateFilter('contentCategory', 'Any Movie');
      updateFilter('storyFocus', 'any');
    }
    if (step === 3) {
      updateFilter('contentCategory', filters.mode === 'movie' ? 'Any Movie' : 'Any Series');
    }
    if (step === 4) updateFilter('storyFocus', 'any');
    if (step === 5) updateFilter('selectedGenres', []);
    if (step === 6) updateFilter('rating', DEFAULT_FILTERS.rating);
    if (step === 7) updateFilter('duration', 'any');
    if (step === 8) {
      updateFilter('tvStatus', 'any');
      updateFilter('seasonRange', 'any');
    }
    if (step === 9) {
      updateFilter('personId', null);
      updateFilter('personName', '');
      setActorQuery('');
      setActorResults([]);
      setPopularActors([]);
      setRelatedActors([]);
    }
    if (step === 10) updateFilter('language', '');
    if (step === 11) {
      updateFilter('era', 'any');
      runFinder();
      return;
    }
    nextStep();
  };

  const toggleGenre = (genreId) => {
    setFilters((prev) => {
      const exists = prev.selectedGenres.includes(genreId);
      return {
        ...prev,
        selectedGenres: exists
          ? prev.selectedGenres.filter((id) => id !== genreId)
          : [...prev.selectedGenres, genreId],
      };
    });
  };

  const applyRuntimeFilter = (params, durationKey) => {
    if (durationKey === 'short') {
      params['with_runtime.lte'] = 45;
    } else if (durationKey === 'standard') {
      params['with_runtime.gte'] = 46;
      params['with_runtime.lte'] = 90;
    } else if (durationKey === 'long') {
      params['with_runtime.gte'] = 91;
      params['with_runtime.lte'] = 140;
    } else if (durationKey === 'epic') {
      params['with_runtime.gte'] = 141;
    }
  };

  const applyEraFilter = (params, eraKey, isTvQuery) => {
    if (eraKey === 'classic') {
      if (isTvQuery) params['first_air_date.lte'] = '1999-12-31';
      else params['primary_release_date.lte'] = '1999-12-31';
    } else if (eraKey === 'modern') {
      if (isTvQuery) {
        params['first_air_date.gte'] = '2000-01-01';
        params['first_air_date.lte'] = '2015-12-31';
      } else {
        params['primary_release_date.gte'] = '2000-01-01';
        params['primary_release_date.lte'] = '2015-12-31';
      }
    } else if (eraKey === 'latest') {
      if (isTvQuery) params['first_air_date.gte'] = '2016-01-01';
      else params['primary_release_date.gte'] = '2016-01-01';
    }
  };

  const applyTVStateFilter = (params) => {
    if (filters.tvStatus === 'completed') {
      params.with_status = '3';
    } else if (filters.tvStatus === 'airing') {
      params.with_status = '0';
    }
  };

  const applyModeGenres = () => {
    const modeGenres = [];
    if (filters.mode === 'drama') modeGenres.push(18);
    if (filters.mode === 'anime') modeGenres.push(16);
    return modeGenres;
  };

  const applyStoryFocusFilter = (items) => {
    if (filters.storyFocus === 'any') return items;

    const activeFocus = STORY_FOCUS_OPTIONS.find((option) => option.key === filters.storyFocus);
    if (!activeFocus?.keywords?.length) return items;

    const filtered = items.filter((item) => {
      const searchableText = `${item.title || item.name || ''} ${item.overview || ''}`.toLowerCase();
      return activeFocus.keywords.some((keyword) => searchableText.includes(keyword));
    });

    return filtered;
  };

  const getSeasonMatcher = () => {
    if (filters.seasonRange === '1-2') return (count) => count >= 1 && count <= 2;
    if (filters.seasonRange === '3-5') return (count) => count >= 3 && count <= 5;
    if (filters.seasonRange === '6+') return (count) => count >= 6;
    return () => true;
  };

  const enrichAndFilterTVBySeasons = async (tvItems) => {
    if (filters.seasonRange === 'any') return tvItems;

    const matcher = getSeasonMatcher();
    const trimmed = tvItems.slice(0, 20);

    const detailed = await Promise.all(
      trimmed.map(async (item) => {
        try {
          const detail = await getTVDetails(item.id);
          return { ...item, number_of_seasons: item.number_of_seasons ?? detail?.number_of_seasons };
        } catch {
          return item;
        }
      })
    );

    return detailed.filter((item) => matcher(item.number_of_seasons || 0));
  };

  const enforcePersonFilter = async (items) => {
    if (!filters.personId) return items;

    const inspected = items.slice(0, 60);
    const checks = await Promise.all(
      inspected.map(async (item) => {
        try {
          const credits = item.media_type === 'tv'
            ? await getTVCredits(item.id)
            : await getMovieCredits(item.id);
          const exists = (credits?.cast || []).some((member) => member.id === filters.personId);
          return exists ? item : null;
        } catch {
          return null;
        }
      })
    );

    return checks.filter(Boolean);
  };

  const buildNoMatchEscalationMessage = () => {
    const summary = [
      filters.mood ? `mood: ${filters.mood}` : null,
      `mode: ${filters.mode}`,
      `rating >= ${filters.rating}`,
      filters.personName ? `actor: ${filters.personName}` : null,
      filters.language ? `language: ${filters.language}` : null,
      filters.storyFocus !== 'any' ? `story focus: ${filters.storyFocus}` : null,
    ].filter(Boolean).join(', ');

    return `Sorry, I could not find exact matches for your selected filters (${summary}). Can you explain it a bit more? You can type it or use the mic, and I will suggest accurate titles based on your prompt.`;
  };

  const runFinder = async () => {
    setLoading(true);
    try {
      const moodGenre = MOOD_GENRES[filters.mood];
      const category = categoryOptions.find((item) => item.label === filters.contentCategory);
      const modeGenres = applyModeGenres();

      const mergedGenres = [
        ...filters.selectedGenres,
        ...(category?.genres || []),
        ...modeGenres,
        ...(moodGenre ? [moodGenre] : []),
      ];

      const uniqueGenres = [...new Set(mergedGenres)];

      const movieParams = {
        sort_by: 'popularity.desc',
        include_adult: false,
        'vote_average.gte': filters.rating,
      };

      const tvParams = {
        sort_by: 'popularity.desc',
        include_adult: false,
        'vote_average.gte': filters.rating,
      };

      if (uniqueGenres.length) {
        movieParams.with_genres = uniqueGenres.join(',');
        tvParams.with_genres = uniqueGenres.join(',');
      }

      if (filters.language) {
        movieParams.with_original_language = filters.language;
        tvParams.with_original_language = filters.language;
      }

      applyRuntimeFilter(movieParams, filters.duration);
      applyRuntimeFilter(tvParams, filters.duration);
      applyEraFilter(movieParams, filters.era, false);
      applyEraFilter(tvParams, filters.era, true);
      applyTVStateFilter(tvParams);

      if (filters.personId) {
        movieParams.with_cast = filters.personId;
        tvParams.with_people = filters.personId;
      }

      let final = [];

      if (filters.mode === 'movie') {
        const movieData = await discoverContent(movieParams);
        final = (movieData?.results || []).map((item) => ({ ...item, media_type: 'movie' }));
      } else if (filters.mode === 'tv') {
        const tvData = await discoverTV(tvParams);
        const tvOnly = (tvData?.results || []).map((item) => ({ ...item, media_type: 'tv' }));
        final = await enrichAndFilterTVBySeasons(tvOnly);
      } else {
        const [movieData, tvData] = await Promise.all([
          discoverContent(movieParams),
          discoverTV(tvParams),
        ]);

        const movies = (movieData?.results || []).map((item) => ({ ...item, media_type: 'movie' }));
        const tv = (tvData?.results || []).map((item) => ({ ...item, media_type: 'tv' }));
        const filteredTv = await enrichAndFilterTVBySeasons(tv);
        final = [...movies, ...filteredTv];
      }

      // Enforce strict matching so every selected filter is respected.
      final = final.filter((item) => {
        const genreIds = Array.isArray(item.genre_ids) ? item.genre_ids : [];

        if (moodGenre && !genreIds.includes(moodGenre)) return false;
        if (uniqueGenres.length > 0 && uniqueGenres.some((id) => !genreIds.includes(id))) return false;
        if (Number(item.vote_average || 0) < Number(filters.rating || 0)) return false;
        if (filters.language && item.original_language !== filters.language) return false;

        return true;
      });

      final = applyStoryFocusFilter(final);
      final = await enforcePersonFilter(final);
      final.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      const finalMatches = final.slice(0, 60);
      setResults(finalMatches);

      if (finalMatches.length === 0 && typeof onNoResultsToChat === 'function') {
        onNoResultsToChat(buildNoMatchEscalationMessage());
      }

      setStep(12);
    } catch (err) {
      console.error('Smart finder search failed', err);
      setResults([]);
      if (typeof onNoResultsToChat === 'function') {
        onNoResultsToChat(buildNoMatchEscalationMessage());
      }
      setStep(12);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 text-center">
            <div className="flex justify-between items-center gap-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Choose your mood</h2>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-full border border-gray-700 text-gray-300 text-xs md:text-sm font-bold uppercase tracking-wider hover:border-gray-500 hover:text-white transition-all"
              >
                Clear all filters
              </button>
            </div>
            <p className="text-gray-400">Pick a mood or skip this step to keep recommendations broad.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(MOOD_GENRES).map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    updateFilter('mood', mood);
                    nextStep();
                  }}
                  className={`p-6 rounded-xl border-2 transition-all font-bold uppercase tracking-widest ${
                    filters.mood === mood
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">What do you want to watch?</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MODE_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.key}
                    onClick={() => {
                      updateFilter('mode', option.key);
                      updateFilter('contentCategory', option.key === 'movie' ? 'Any Movie' : 'Any Series');
                      updateFilter('storyFocus', 'any');
                      nextStep();
                    }}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                      filters.mode === option.key
                        ? 'border-red-600 bg-red-600/20 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <Icon size={34} />
                    <span className="font-bold uppercase tracking-widest text-sm">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              {filters.mode === 'movie' ? 'Movie category' : 'Series category'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryOptions.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    updateFilter('contentCategory', item.label);
                    nextStep();
                  }}
                  className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                    filters.contentCategory === item.label
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Story focus</h2>
            <p className="text-gray-400">Pick what the main story feels centered around.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STORY_FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    updateFilter('storyFocus', option.key);
                    nextStep();
                  }}
                  className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                    filters.storyFocus === option.key
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pick genres</h2>
            <p className="text-gray-400">Choose one or multiple genres.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MAIN_GENRES.map((genre) => {
                const active = filters.selectedGenres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                      active
                        ? 'border-red-600 bg-red-600/20 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {genre.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={nextStep}
              className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all"
            >
              Continue
            </button>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Minimum rating</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[5, 6, 7, 8, 9].map((rating) => (
                <button
                  key={rating}
                  onClick={() => {
                    updateFilter('rating', rating);
                    nextStep();
                  }}
                  className={`p-6 rounded-xl border-2 transition-all font-bold uppercase tracking-widest ${
                    filters.rating === rating
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <Star size={16} /> {rating}+
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              {includesTV ? 'Episode or runtime length' : 'Movie runtime'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    updateFilter('duration', option.key);
                    nextStep();
                  }}
                  className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                    filters.duration === option.key
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Clock size={16} /> {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Series details</h2>
            <p className="text-gray-400">Set airing status and season count.</p>

            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-200">Airing status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'any', label: 'Any' },
                  { key: 'airing', label: 'Currently Airing' },
                  { key: 'completed', label: 'Completed' },
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => updateFilter('tvStatus', status.key)}
                    className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                      filters.tvStatus === status.key
                        ? 'border-red-600 bg-red-600/20 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest text-gray-200">Season count</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {SEASON_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => updateFilter('seasonRange', option.key)}
                    className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                      filters.seasonRange === option.key
                        ? 'border-red-600 bg-red-600/20 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextStep}
              className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all"
            >
              Continue
            </button>
          </div>
        );

      case 9:
        const visibleActors = actorQuery.trim().length >= 2 ? actorResults : popularActors;
        const actorSectionTitle = actorQuery.trim().length >= 2 ? 'Search results' : 'Popular actors';

        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Choose actor or actress</h2>
            <p className="text-gray-400">Search and pick a profile. Results will include only titles featuring that person.</p>

            <div className="max-w-3xl mx-auto space-y-6">
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  value={actorQuery}
                  onChange={(e) => {
                    setActorQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      updateFilter('personId', null);
                      updateFilter('personName', '');
                    }
                  }}
                  placeholder="Search actor profiles (e.g. Shah Rukh Khan, Emma Stone)"
                  className="w-full bg-white/5 border-2 border-gray-800 rounded-xl py-4 pl-12 pr-4 text-white outline-none focus:border-red-600 transition-all"
                />
              </div>

              {filters.personId && (
                <div className="flex items-center justify-between bg-white/5 border border-red-500/40 rounded-2xl px-4 py-3">
                  <div className="text-left">
                    <p className="text-xs uppercase tracking-widest text-gray-400">Selected profile</p>
                    <p className="text-white font-bold">{filters.personName}</p>
                  </div>
                  <button
                    onClick={clearActorSelection}
                    className="px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition-all"
                  >
                    Remove
                  </button>
                </div>
              )}

              {actorLoading && <p className="text-gray-400 text-sm">Searching profiles...</p>}

              {!actorLoading && visibleActors.length > 0 && (
                <div className="space-y-4">
                  <p className="text-left text-gray-300 font-bold uppercase tracking-widest text-sm">{actorSectionTitle}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {visibleActors.map((person) => {
                      const active = filters.personId === person.id;
                      const imageUrl = person.profile_path ? `${POSTER_BASE_URL}${person.profile_path}` : '';
                      return (
                        <button
                          key={person.id}
                          onClick={() => selectActor(person)}
                          className={`p-3 rounded-2xl border-2 transition-all text-center ${
                            active ? 'border-red-600 bg-red-600/20 text-white' : 'border-gray-800 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-900 border border-gray-700">
                            {imageUrl ? (
                              <img src={imageUrl} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">NO IMG</div>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-bold leading-tight line-clamp-2">{person.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!actorLoading && filters.personId && relatedActors.length > 0 && (
                <div className="space-y-4">
                  <p className="text-left text-gray-300 font-bold uppercase tracking-widest text-sm">Related profiles</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {relatedActors.map((person) => {
                      const imageUrl = person.profile_path ? `${POSTER_BASE_URL}${person.profile_path}` : '';
                      return (
                        <button
                          key={`related-${person.id}`}
                          onClick={() => selectActor(person)}
                          className="p-3 rounded-2xl border-2 border-gray-800 text-gray-300 hover:border-gray-600 transition-all text-center"
                        >
                          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-gray-900 border border-gray-700">
                            {imageUrl ? (
                              <img src={imageUrl} alt={person.name} className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">NO IMG</div>
                            )}
                          </div>
                          <p className="mt-2 text-xs font-bold leading-tight line-clamp-2">{person.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={nextStep}
                className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all"
              >
                {filters.personId ? 'Use selected profile' : 'Continue without actor'}
              </button>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Preferred language</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={`${lang.code || 'any'}-${lang.name}`}
                  onClick={() => {
                    updateFilter('language', lang.code);
                    nextStep();
                  }}
                  className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                    filters.language === lang.code
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Release era</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ERA_OPTIONS.map((era) => (
                <button
                  key={era.key}
                  onClick={() => updateFilter('era', era.key)}
                  className={`p-5 rounded-xl border-2 transition-all font-bold uppercase tracking-wider text-sm ${
                    filters.era === era.key
                      ? 'border-red-600 bg-red-600/20 text-white'
                      : 'border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {era.label}
                </button>
              ))}
            </div>

            <button
              onClick={runFinder}
              className="inline-flex items-center gap-2 px-10 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-full hover:bg-red-700 transition-all"
            >
              <Search size={18} /> Find Titles
            </button>
          </div>
        );

      case 12:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Recommendations for you</h2>
              <button
                onClick={() => {
                  setResults([]);
                  setStep(1);
                }}
                className="text-red-600 font-bold uppercase tracking-widest hover:underline"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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

            {results.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <p className="text-xl">No exact matches found for your filters.</p>
                <p className="mt-2 text-sm text-gray-400">We redirected you to AI chat so you can refine your request by typing or using the mic.</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/95 flex flex-col p-4 md:p-12 overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3 text-red-600">
          <Sparkles size={32} />
          <h1 className="text-2xl font-black uppercase tracking-widest">Smart Finder</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onPreferenceSearch) onPreferenceSearch();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 text-xs md:text-sm font-bold uppercase tracking-wider hover:bg-emerald-600/30 transition-all"
          >
            Use Saved Preferences
          </button>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={32} />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 font-bold uppercase tracking-widest animate-pulse">Finding the perfect match...</p>
          </div>
        ) : (
          renderStep()
        )}
      </div>

      {step >= 1 && step < 12 && !loading && (
        <div className="mt-8 pb-6 flex justify-center gap-3 md:gap-4 flex-wrap">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-8 py-3 rounded-full bg-gray-800 text-white font-bold uppercase tracking-widest hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={skipCurrentStep}
            className="px-8 py-3 rounded-full bg-white/10 border border-gray-700 text-gray-200 font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
          >
            {step === 11 ? 'Skip & Find' : 'Skip'}
          </button>
        </div>
      )}
    </motion.div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Film, Play, Plus, Star, Check, ThumbsUp, ChevronDown, Lock } from 'lucide-react';
import { POSTER_BASE_URL, getMovieVideos, getTVVideos, GENRE_MAP } from '../services/tmdb';

export default function MovieCard({ movie, onClick, isTV: isTVProp = false, onToggleList, isInList, isAuthenticated = true, onRequireAuth }) {
  const isTV = isTVProp || movie.media_type === 'tv' || !!movie.first_air_date;
  const [isHovered, setIsHovered] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const posterUrl = movie.poster_path
    ? `${POSTER_BASE_URL}${movie.poster_path}`
    : (movie.backdrop_path ? `${POSTER_BASE_URL}${movie.backdrop_path}` : null);

  const backdropUrl = movie.backdrop_path
    ? `${POSTER_BASE_URL}${movie.backdrop_path}`
    : (movie.poster_path ? `${POSTER_BASE_URL}${movie.poster_path}` : null);

  const fallbackUrl = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

  const primaryGenre = useMemo(() => {
    if (movie.genre_ids?.length > 0) return GENRE_MAP[movie.genre_ids[0]];
    if (movie.genres?.length > 0) return movie.genres[0].name;
    return null;
  }, [movie.genre_ids, movie.genres]);

  useEffect(() => {
    let timeout;

    if (isHovered) {
      timeout = setTimeout(async () => {
        try {
          const fetchFn = isTV ? getTVVideos : getMovieVideos;
          const data = await fetchFn(movie.id);
          const trailer = data.results.find((video) => video.type === 'Trailer' && video.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);
        } catch (error) {
          console.error('Failed to fetch trailer', error);
        }
      }, 350);
    } else {
      setTrailerKey(null);
    }

    return () => clearTimeout(timeout);
  }, [isHovered, movie.id, isTV]);

  const handleAction = (event, action) => {
    event.stopPropagation();

    if (action === 'play' || action === 'more') {
      onClick(movie, isTV ? 'tv' : 'movie');
    } else if (action === 'list') {
      if (!isAuthenticated) {
        onRequireAuth?.('watchlist');
        return;
      }
      onToggleList(movie);
    } else if (action === 'like') {
      if (!isAuthenticated) {
        onRequireAuth?.('watchlist');
        return;
      }
      setIsLiked((prev) => !prev);
    }
  };

  const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '—';
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—';

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ duration: 0.22 }}
      className="group relative shrink-0 w-44 md:w-56 lg:w-64 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(movie, isTV ? 'tv' : 'movie')}
    >
      <div className="relative overflow-hidden rounded-[1.35rem] border border-white/8 bg-white/[0.03] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
          <motion.img
            src={!imgError && posterUrl ? posterUrl : fallbackUrl}
            alt={movie.title || movie.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
          />

          {(!posterUrl && !imgError) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-linear-to-br from-slate-900 via-slate-950 to-slate-900 p-4 text-center">
              <Film className="text-white/15" size={40} />
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">{movie.title || movie.name}</p>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/18 to-transparent" />
          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-linear-to-br from-red-500/14 via-transparent to-cyan-400/12" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className="rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
              {isTV ? 'Series' : 'Movie'}
            </span>
          </div>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-yellow-200 backdrop-blur-md">
              <Star size={10} className="fill-current" />
              {rating}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{movie.title || movie.name}</p>
              <p className="text-xs text-white/55">{year}</p>
            </div>
            {primaryGenre && (
              <span className="shrink-0 rounded-full border border-white/10 bg-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur-md">
                {primaryGenre}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-transparent via-red-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="absolute left-0 right-0 top-0 z-40 overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950/96 shadow-[0_30px_80px_rgba(0,0,0,0.75)] backdrop-blur-xl"
          >
            <div className="relative aspect-[16/9] bg-black">
              {trailerKey ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1`}
                    className="h-full w-full pointer-events-none"
                    allow="autoplay"
                    title={`${movie.title || movie.name} trailer preview`}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-transparent to-transparent" />
                </>
              ) : (
                <>
                  <img
                    src={backdropUrl || fallbackUrl}
                    className="h-full w-full object-cover opacity-60"
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/42">
                    <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(event) => handleAction(event, 'play')}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                    aria-label="Open details"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <button
                    onClick={(event) => handleAction(event, 'list')}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isInList ? 'border-red-400/40 bg-red-500/18 text-red-100' : 'border-white/12 bg-white/6 text-white/75 hover:bg-white/10'}`}
                    aria-label={isInList ? 'Remove from list' : 'Add to list'}
                  >
                    {isInList ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                  <button
                    onClick={(event) => handleAction(event, 'like')}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all ${isLiked ? 'border-white/20 bg-white text-black' : 'border-white/12 bg-white/6 text-white/75 hover:bg-white/10'}`}
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                  >
                    <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <button
                  onClick={(event) => handleAction(event, 'more')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/75 hover:bg-white/10"
                  aria-label="More details"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">TMDB {rating}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">IMDb-style</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">{year}</span>
              </div>

              <p className="line-clamp-3 text-sm leading-6 text-white/72">
                {movie.overview || 'A cinematic pick tailored to your taste.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

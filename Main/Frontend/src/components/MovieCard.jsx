import React, { useState, useEffect } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown, Star, Check, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { POSTER_BASE_URL, getMovieVideos, getTVVideos, GENRE_MAP } from '../services/tmdb';

export default function MovieCard({ movie, onClick, isTV: isTVProp = false, onToggleList, isInList }) {
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

  const fallbackUrl = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=80';

  const primaryGenre = movie.genre_ids && movie.genre_ids.length > 0 
    ? GENRE_MAP[movie.genre_ids[0]] 
    : (movie.genres && movie.genres.length > 0 ? movie.genres[0].name : null);

  useEffect(() => {
    let timeout;
    if (isHovered) {
      timeout = setTimeout(async () => {
        try {
          const fetchFn = isTV ? getTVVideos : getMovieVideos;
          const data = await fetchFn(movie.id);
          const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          if (trailer) setTrailerKey(trailer.key);
        } catch (err) {
          console.error('Failed to fetch trailer', err);
        }
      }, 500);
    } else {
      setTrailerKey(null);
    }
    return () => clearTimeout(timeout);
  }, [isHovered, movie.id, isTV]);

  const handleAction = (e, action) => {
    e.stopPropagation();
    if (action === 'play' || action === 'more') {
      onClick(movie, isTV ? 'tv' : 'movie');
    } else if (action === 'list') {
      onToggleList(movie);
    } else if (action === 'like') {
      setIsLiked(!isLiked);
    }
  };

  return (
    <div 
      className="relative shrink-0 w-40 md:w-60 h-60 md:h-90 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(movie, isTV ? 'tv' : 'movie')}
    >
      <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative shadow-xl">
        <motion.img
          src={!imgError && posterUrl ? posterUrl : fallbackUrl}
          alt={movie.title || movie.name}
          className="w-full h-full object-cover rounded-lg"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        {(!posterUrl && !imgError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 backdrop-blur-sm">
            <Film className="text-gray-600 mb-2" size={40} />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-tight">
              {movie.title || movie.name}
            </p>
          </div>
        )}
        
        {/* Card Glow Effect on Hover */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-linear-to-t from-red-600/30 via-purple-600/20 to-transparent rounded-lg pointer-events-none"
        />
      </div>

      <AnimatePresence mode="wait">
        {isHovered && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 0 }}
            animate={{ scale: 1.2, opacity: 1, y: -50 }}
            exit={{ scale: 0.9, opacity: 0, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-50 bg-[#1a1a1a] rounded-lg shadow-[0_0_30px_rgba(220,38,38,0.5),0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden border border-red-600/30"
          >
            <div className="h-44 w-full relative bg-black">
              {trailerKey ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1`}
                    className="w-full h-full pointer-events-none"
                    allow="autoplay"
                  />
                  {/* Trailer Overlay Gradient */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#1a1a1a] via-transparent to-transparent pointer-events-none" />
                </>
              ) : (
                <div className="relative w-full h-full bg-linear-to-br from-gray-900 to-black">
                  <img
                    src={backdropUrl || fallbackUrl}
                    className="w-full h-full object-cover opacity-50"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 space-y-3 bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAction(e, 'play')}
                    aria-label="Play details"
                    className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-all shadow-lg"
                  >
                    <Play size={16} fill="black" className="ml-0.5" />
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAction(e, 'list')}
                    aria-label={isInList ? 'Remove from list' : 'Add to list'}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                      isInList 
                        ? 'bg-red-600 border-red-600 text-white shadow-red-600/50' 
                        : 'border-gray-500 text-gray-300 hover:border-white hover:bg-white/10'
                    }`}
                    title={isInList ? "Remove from List" : "Add to List"}
                  >
                    {isInList ? <Check size={16} /> : <Plus size={16} />}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleAction(e, 'like')}
                    aria-label={isLiked ? 'Unlike content' : 'Like content'}
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all shadow-lg ${
                      isLiked 
                        ? 'bg-white border-white text-black' 
                        : 'border-gray-500 text-gray-300 hover:border-white hover:bg-white/10'
                    }`}
                  >
                    <ThumbsUp size={16} fill={isLiked ? "black" : "none"} />
                  </motion.button>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleAction(e, 'more')}
                  aria-label="More details"
                  className="w-9 h-9 rounded-full border-2 border-gray-500 flex items-center justify-center text-gray-300 hover:border-white hover:bg-white/10 transition-all shadow-lg"
                >
                  <ChevronDown size={16} />
                </motion.button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-400 font-bold bg-green-900/30 px-2 py-0.5 rounded">
                    {Math.round(movie.vote_average * 10)}% Match
                  </span>
                  <span className="text-gray-400 border border-gray-600 px-1.5 py-0.5 text-[10px] font-semibold rounded">
                    HD
                  </span>
                </div>
                <h3 className="text-white font-bold text-sm truncate">
                  {movie.title || movie.name}
                </h3>
                {primaryGenre && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest bg-red-900/20 inline-block px-2 py-0.5 rounded">
                    {primaryGenre}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="currentColor" className="text-yellow-500" />
                    <span className="text-yellow-500 font-semibold">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  <span>•</span>
                  <span className="font-medium">{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

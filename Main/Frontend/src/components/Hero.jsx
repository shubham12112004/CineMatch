import React, { useState, useEffect } from 'react';
import { Play, Info, Star, Plus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { IMAGE_BASE_URL } from '../services/tmdb';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.1
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 },
      scale: { duration: 1.5 }
    }
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.9,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.5 }
    }
  })
};

export default function Hero({ movie, onInfoClick, onToggleList, isInList, pool = [], currentIndex = 0, onIndexChange, contextLabel = 'All Content', contextDescription = '' }) {
  const [direction, setDirection] = useState(0);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  
  // Parallax effect
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    if (currentIndex !== prevIndex) {
      let newDir = currentIndex > prevIndex ? 1 : -1;
      // Handle wrap around
      if (currentIndex === 0 && prevIndex === pool.length - 1) newDir = 1;
      if (currentIndex === pool.length - 1 && prevIndex === 0) newDir = -1;
      
      setDirection(newDir);
      setPrevIndex(currentIndex);
    }
  }, [currentIndex, prevIndex, pool.length]);

  if (!movie) return <div className="h-[80vh] bg-black animate-pulse" />;

  const handlePrev = () => {
    const prev = (currentIndex - 1 + pool.length) % pool.length;
    onIndexChange(prev);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % pool.length;
    onIndexChange(next);
  };

  return (
    <div className="relative h-[95vh] w-full overflow-hidden group bg-black">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div 
          key={movie.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{ y }}
          className="absolute inset-0"
        >
          <img
            src={`${IMAGE_BASE_URL}${movie.backdrop_path}`}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Enhanced Cinematic Gradients */}
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/70 to-transparent z-10" />
          <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/30 z-10" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
      >
        <ChevronLeft size={32} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-4 bg-black/20 hover:bg-black/50 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
      >
        <ChevronRight size={32} />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-10 right-12 z-30 flex gap-2">
        {pool.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx)}
            className={`h-1.5 transition-all duration-500 rounded-full ${currentIndex === idx ? 'w-10 bg-red-600 shadow-lg shadow-red-600/50' : 'w-2 bg-white/30 hover:bg-white/50 hover:w-4'}`}
          />
        ))}
      </div>

      <motion.div 
        style={{ opacity }}
        className="absolute bottom-[15%] left-4 md:left-12 max-w-3xl space-y-6 z-20"
      >
        <motion.div 
          key={`meta-${movie.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/30 text-yellow-500 font-black shadow-lg">
            <Star size={18} fill="currentColor" />
            <span className="text-lg">{movie.vote_average?.toFixed(1)}</span>
          </div>
          <span className="text-gray-300 font-bold tracking-widest text-sm bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
            {(movie.release_date || movie.first_air_date)?.split('-')[0]}
          </span>
          <span className="text-red-500 font-black tracking-wider text-sm uppercase px-3 py-1 border-2 border-red-600 rounded-full bg-red-600/20 shadow-lg shadow-red-600/30">
            {movie.first_air_date ? 'TRENDING SERIES' : 'TRENDING MOVIE'}
          </span>
          <span className="text-cyan-300 font-black tracking-wider text-sm uppercase px-3 py-1 border border-cyan-400/30 rounded-full bg-cyan-500/10 shadow-lg shadow-cyan-500/10">
            {contextLabel}
          </span>
        </motion.div>
        
        <motion.h1 
          key={`title-${movie.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl [text-shadow:0_4px_20px_rgb(0_0_0/80%)]"
        >
          {movie.title || movie.name}
        </motion.h1>
        
        <motion.p 
          key={`desc-${movie.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-100 text-base md:text-xl line-clamp-3 font-medium leading-relaxed max-w-2xl drop-shadow-lg [text-shadow:0_2px_10px_rgb(0_0_0/60%)]"
        >
          {movie.overview}
        </motion.p>

        {contextDescription && (
          <motion.p
            key={`context-${movie.id}-${contextLabel}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-cyan-100/90 text-sm md:text-base font-semibold tracking-wide uppercase"
          >
            {contextDescription}
          </motion.p>
        )}

        <motion.div 
          key={`btns-${movie.id}`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-4 pt-4 flex-wrap"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black px-8 md:px-10 py-3 md:py-4 rounded-md font-black text-lg md:text-xl flex items-center gap-3 hover:bg-white/90 transition-all shadow-2xl"
            onClick={() => onInfoClick(movie, movie.first_air_date ? 'tv' : 'movie')}
          >
            <Play size={28} fill="black" />
            Play Trailer
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gray-600/40 text-white px-8 md:px-10 py-3 md:py-4 rounded-md font-black text-lg md:text-xl flex items-center gap-3 hover:bg-gray-600/60 transition-all backdrop-blur-xl border border-white/20 shadow-2xl"
            onClick={() => onInfoClick(movie, movie.first_air_date ? 'tv' : 'movie')}
          >
            <Info size={28} />
            More Info
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-14 h-14 md:w-16 md:h-16 rounded-md border-2 flex items-center justify-center transition-all backdrop-blur-xl shadow-2xl ${
              isInList 
                ? 'bg-red-600 border-red-600 text-white shadow-red-600/50' 
                : 'bg-gray-600/40 border-white/20 text-white hover:bg-gray-600/60'
            }`}
            onClick={() => onToggleList(movie)}
            title={isInList ? "Remove from List" : "Add to List"}
          >
            {isInList ? <Check size={32} /> : <Plus size={32} />}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

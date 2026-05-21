import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, Play, Sparkles, Star, Ticket, WandSparkles } from 'lucide-react';
import { IMAGE_BASE_URL } from '../services/tmdb';

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 260, damping: 28 },
      opacity: { duration: 0.45 },
      scale: { duration: 0.9 },
    },
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 260, damping: 28 },
      opacity: { duration: 0.35 },
    },
  }),
};

export default function Hero({ movie, onInfoClick, onToggleList, isInList, pool = [], currentIndex = 0, onIndexChange, contextLabel = 'All Content', contextDescription = '' }) {
  const [direction, setDirection] = useState(0);
  const [prevIndex, setPrevIndex] = useState(currentIndex);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 700], [0, 140]);
  const opacity = useTransform(scrollY, [0, 280], [1, 0.28]);

  useEffect(() => {
    if (currentIndex !== prevIndex) {
      let nextDirection = currentIndex > prevIndex ? 1 : -1;
      if (currentIndex === 0 && prevIndex === pool.length - 1) nextDirection = 1;
      if (currentIndex === pool.length - 1 && prevIndex === 0) nextDirection = -1;
      setDirection(nextDirection);
      setPrevIndex(currentIndex);
    }
  }, [currentIndex, prevIndex, pool.length]);

  if (!movie) return <div className="h-[82vh] bg-slate-950 animate-pulse" />;

  const handlePrev = () => onIndexChange((currentIndex - 1 + pool.length) % pool.length);
  const handleNext = () => onIndexChange((currentIndex + 1) % pool.length);

  const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '—';
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : '—';

  return (
    <section className="hero-backdrop relative h-[88vh] min-h-[640px] w-full overflow-hidden bg-[#04070b]">
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
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/62 to-black/20" />
          <div className="absolute inset-0 bg-linear-to-t from-[#04070b] via-black/12 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.08),transparent_35%)]" />

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 p-4 text-white backdrop-blur-xl transition hover:bg-black/55 md:flex"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 p-4 text-white backdrop-blur-xl transition hover:bg-black/55 md:flex"
      >
        <ChevronRight size={24} />
      </button>

      <motion.div
        style={{ opacity }}
        className="section-shell relative z-20 flex h-full items-end pb-16 pt-28 md:pb-20"
      >
        <div className="max-w-4xl space-y-6">
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
              {contextLabel}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
              {year}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white/70">
              {movie.first_air_date ? 'Series' : 'Movie'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-amber-100">
              <Star size={12} className="fill-current" />
              {rating}
            </span>
          </motion.div>

          <motion.h1
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.55 }}
            className="max-w-3xl text-5xl font-black tracking-[-0.06em] text-white md:text-7xl lg:text-8xl"
          >
            {movie.title || movie.name}
          </motion.h1>

          <motion.p
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.55 }}
            className="section-copy max-w-2xl text-base md:text-lg"
          >
            {movie.overview}
          </motion.p>

          {contextDescription && (
            <motion.p
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.5 }}
              className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55"
            >
              {contextDescription}
            </motion.p>
          )}

          <motion.div
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.55 }}
            className="flex flex-wrap items-center gap-3 pt-2"
          >
            <button
              onClick={() => onInfoClick(movie, movie.first_air_date ? 'tv' : 'movie')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02]"
            >
              <Play size={16} fill="currentColor" />
              Watch Now
            </button>
            <button
              onClick={() => onInfoClick(movie, movie.first_air_date ? 'tv' : 'movie')}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Sparkles size={16} />
              Explore
            </button>
            <button
              onClick={() => onToggleList(movie)}
              className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${isInList ? 'border-red-400/30 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/5 text-white hover:bg-white/10'}`}
            >
              <Ticket size={16} />
              {isInList ? 'Saved' : 'Add to List'}
            </button>
            <button
              onClick={() => onInfoClick(movie, movie.first_air_date ? 'tv' : 'movie')}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
            >
              <WandSparkles size={16} />
              Get Recommendations
            </button>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-6 right-6 z-30 flex gap-2">
        {pool.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onIndexChange(idx)}
            className={`h-1.5 rounded-full transition-all ${currentIndex === idx ? 'w-10 bg-white shadow-[0_0_16px_rgba(255,255,255,0.45)]' : 'w-4 bg-white/25 hover:bg-white/45'}`}
          />
        ))}
      </div>
    </section>
  );
}

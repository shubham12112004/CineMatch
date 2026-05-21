import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

export default function MovieRow({ title, movies, onMovieClick, isTV = false, onToggleList, myList, loading = false, eyebrow, description }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (!rowRef.current) return;

    const { scrollLeft, clientWidth } = rowRef.current;
    const amount = Math.max(clientWidth * 0.82, 280);
    const target = direction === 'left' ? scrollLeft - amount : scrollLeft + amount;
    rowRef.current.scrollTo({ left: target, behavior: 'smooth' });
  };

  if (!loading && (!movies || movies.length === 0)) return null;

  return (
    <section className="section-shell py-8 md:py-12">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          {eyebrow && <p className="section-kicker">{eyebrow}</p>}
          <h2 className="section-title text-white">{title}</h2>
          {description && <p className="section-copy text-sm md:text-base">{description}</p>}
        </div>

        {!loading && movies?.length > 4 && (
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              aria-label={`Scroll ${title} left`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
              onClick={() => scroll('left')}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label={`Scroll ${title} right`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10"
              onClick={() => scroll('right')}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonLoader count={6} />
      ) : (
        <div
          ref={rowRef}
          className="no-scrollbar flex gap-4 overflow-x-auto pb-3 pt-2 pr-2 scroll-smooth"
        >
          {movies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onClick={onMovieClick}
              isTV={isTV}
              onToggleList={onToggleList}
              isInList={myList?.some((m) => m.id === movie.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

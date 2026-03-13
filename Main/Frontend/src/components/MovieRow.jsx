import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import SkeletonLoader from './SkeletonLoader';

export default function MovieRow({ title, movies, onMovieClick, isTV = false, onToggleList, myList, loading = false }) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!loading && (!movies || movies.length === 0)) return null;

  return (
    <div className="space-y-4 py-8 px-4 md:px-12 group relative">
      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase leading-none border-l-4 border-red-600 pl-4 drop-shadow-md">
        {title}
      </h2>
      
      {loading ? (
        <SkeletonLoader count={6} />
      ) : (
        <div className="relative">
          <button 
            aria-label={`Scroll ${title} left`}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-40 h-11 w-11 md:h-12 md:w-12 inline-flex items-center justify-center rounded-full bg-black/35 border border-white/20 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/55 hover:border-white/40"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={28} />
          </button>
          
          <div 
            ref={rowRef}
            className="flex items-center gap-4 overflow-x-scroll no-scrollbar scroll-smooth py-16 -my-12"
          >
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onClick={onMovieClick} 
                isTV={isTV} 
                onToggleList={onToggleList}
                isInList={myList?.some(m => m.id === movie.id)}
              />
            ))}
          </div>

          <button 
            aria-label={`Scroll ${title} right`}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-40 h-11 w-11 md:h-12 md:w-12 inline-flex items-center justify-center rounded-full bg-black/35 border border-white/20 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-black/55 hover:border-white/40"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </div>
  );
}

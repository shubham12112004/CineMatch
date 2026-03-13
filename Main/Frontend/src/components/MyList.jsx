import React from 'react';
import { X, Trash2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { POSTER_BASE_URL } from '../services/tmdb';

export default function MyList({ list, onRemove, onMovieClick, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col p-4 md:p-12 overflow-y-auto custom-scrollbar"
    >
      <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">My List</h1>
          <span className="bg-red-600 text-white text-xs font-black px-2 py-1 rounded-full">{list.length}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X size={32} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full">
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-gray-500">
              <Play size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Your list is empty</h2>
              <p className="text-gray-400 max-w-md">Start adding movies and shows to your list so you can easily find them later.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {list.map(movie => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-red-600 transition-all shadow-2xl"
              >
                <div 
                  className="aspect-[2/3] cursor-pointer overflow-hidden"
                  onClick={() => onMovieClick(movie, movie.first_air_date ? 'tv' : 'movie')}
                >
                  <img 
                    src={`${POSTER_BASE_URL}${movie.poster_path}`} 
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play size={48} className="text-white fill-white" />
                  </div>
                </div>
                
                <div className="p-4 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white truncate flex-1">
                    {movie.title || movie.name}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(movie.id); }}
                    className="text-gray-500 hover:text-red-600 transition-colors p-1"
                    title="Remove from list"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

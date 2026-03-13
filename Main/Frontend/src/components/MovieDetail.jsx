import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, Play } from 'lucide-react';
import { motion } from 'motion/react';
import CustomSelect from './CustomSelect';
import { 
  IMAGE_BASE_URL, 
  POSTER_BASE_URL, 
  getMovieVideos, 
  getMovieCredits, 
  getMovieReviews, 
  getMovieWatchProviders,
  getTVVideos,
  getTVCredits,
  getTVReviews,
  getTVWatchProviders,
  getTVSeasonDetails
} from '../services/tmdb';

export default function MovieDetail({ movie, onClose, isTV = false }) {
  const [videos, setVideos] = useState([]);
  const [credits, setCredits] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasonDetails, setSeasonDetails] = useState(null);
  const [loadingSeason, setLoadingSeason] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchVideos = isTV ? getTVVideos : getMovieVideos;
        const fetchCredits = isTV ? getTVCredits : getMovieCredits;
        const fetchReviews = isTV ? getTVReviews : getMovieReviews;
        const fetchProviders = isTV ? getTVWatchProviders : getMovieWatchProviders;

        const [vData, cData, rData, pData] = await Promise.all([
          fetchVideos(movie.id),
          fetchCredits(movie.id),
          fetchReviews(movie.id),
          fetchProviders(movie.id)
        ]);

        const userRegion = navigator.language.split('-')[1] || 'US';
        const regionData = pData.results?.[userRegion] || pData.results?.US || Object.values(pData.results || {})[0] || null;

        setVideos(vData.results);
        setCredits(cData);
        setReviews(rData.results);
        setProviders(regionData);

        if (isTV && movie.seasons && movie.seasons.length > 0) {
          const firstSeason = movie.seasons.find(s => s.season_number > 0) || movie.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (err) {
        console.error('Error fetching details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movie.id, isTV]);

  useEffect(() => {
    const fetchSeason = async () => {
      if (!isTV || !selectedSeason) return;
      setLoadingSeason(true);
      try {
        const data = await getTVSeasonDetails(movie.id, selectedSeason);
        setSeasonDetails(data);
      } catch (err) {
        console.error('Error fetching season details', err);
      } finally {
        setLoadingSeason(false);
      }
    };
    fetchSeason();
  }, [selectedSeason, movie.id, isTV]);

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const director = credits?.crew?.find(c => c.job === 'Director');
  const creators = movie.created_by;

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-300 font-bold uppercase tracking-widest text-sm animate-pulse">Loading details...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-black/95 backdrop-blur-md overflow-y-auto"
    >
      <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="bg-linear-to-b from-[#1a1a1a] to-[#0a0a0a] w-full max-w-6xl rounded-2xl overflow-hidden relative shadow-[0_0_50px_rgba(220,38,38,0.3)] border border-red-600/20">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 bg-black/80 backdrop-blur-sm p-3 rounded-full text-white hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side: Trailer or Poster */}
            <div className="aspect-video lg:aspect-auto bg-black flex items-center justify-center relative">
              {trailer ? (
                <>
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                    className="w-full h-full min-h-75 lg:min-h-125"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                  {/* Gradient overlay for trailer */}
                  <div className="absolute inset-0 bg-linear-to-t from-[#1a1a1a] via-transparent to-transparent pointer-events-none lg:hidden" />
                </>
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={`${IMAGE_BASE_URL}${movie.backdrop_path || movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#1a1a1a] via-transparent to-transparent" />
                </div>
              )}
            </div>

            {/* Right Side: Info */}
            <div className="p-6 md:p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight [text-shadow:0_4px_20px_rgb(0_0_0/80%)]">
                  {movie.title || movie.name}
                </h2>
                <div className="flex items-center gap-3 flex-wrap text-gray-400 font-medium">
                  <div className="flex items-center gap-2 bg-linear-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1.5 rounded-full text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/20">
                    <Star size={18} fill="currentColor" />
                    <span className="font-black text-lg">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                    <Calendar size={18} />
                    <span>{movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0]}</span>
                  </div>
                  {movie.runtime && (
                    <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      <Clock size={18} />
                      <span>{movie.runtime} min</span>
                    </div>
                  )}
                  {isTV && (
                    <div className="flex items-center gap-2 text-red-400 font-black bg-red-600/20 px-3 py-1.5 rounded-full border border-red-600/30">
                      <span>{movie.number_of_seasons} SEASONS</span>
                      <span>•</span>
                      <span>{movie.number_of_episodes} EPS</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres?.map(genre => (
                  <span key={genre.id} className="px-3 py-1.5 bg-linear-to-r from-gray-800 to-gray-900 text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10 hover:border-red-600/50 transition-colors">
                    {genre.name}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-3">
                  <h3 className="text-white font-black text-xl uppercase tracking-tight border-l-4 border-red-600 pl-3">Overview</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {movie.overview}
                  </p>
                </div>

                <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/10">
                  {director && (
                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Director</h4>
                      <p className="text-white font-bold">{director.name}</p>
                    </div>
                  )}
                  {creators && creators.length > 0 && (
                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Creators</h4>
                      <p className="text-white font-bold">{creators.map(c => c.name).join(', ')}</p>
                    </div>
                  )}
                  {movie.spoken_languages && movie.spoken_languages.length > 0 && (
                    <div>
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Available Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        {movie.spoken_languages.map(lang => (
                          <span key={lang.iso_639_1} className="text-white text-xs font-medium bg-white/10 px-2 py-1 rounded border border-white/20">
                            {lang.english_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {providers && (
                    <div className="space-y-3">
                      <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Where to Watch</h4>
                      
                      {providers.flatrate && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400 uppercase font-bold">Stream</p>
                          <div className="flex flex-wrap gap-3">
                            {providers.flatrate.map(p => (
                              <div key={p.provider_id} className="group relative">
                                <img 
                                  src={`${IMAGE_BASE_URL}${p.logo_path}`} 
                                  className="w-12 h-12 rounded-lg shadow-lg border-2 border-gray-800 hover:border-red-600 transition-all hover:scale-110" 
                                  title={p.provider_name} 
                                  referrerPolicy="no-referrer" 
                                />
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                  {p.provider_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(providers.rent || providers.buy) && (
                        <div className="space-y-2">
                          <p className="text-xs text-gray-400 uppercase font-bold">Rent/Buy</p>
                          <div className="flex flex-wrap gap-3">
                            {[...(providers.rent || []), ...(providers.buy || [])]
                              .filter((v, i, a) => a.findIndex(t => t.provider_id === v.provider_id) === i)
                              .map(p => (
                                <div key={p.provider_id} className="group relative">
                                  <img 
                                    src={`${IMAGE_BASE_URL}${p.logo_path}`} 
                                    className="w-12 h-12 rounded-lg shadow-lg border-2 border-gray-800 hover:border-red-600 transition-all hover:scale-110" 
                                    title={p.provider_name} 
                                    referrerPolicy="no-referrer" 
                                  />
                                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {p.provider_name}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {!providers.flatrate && !providers.buy && !providers.rent && (
                        <p className="text-gray-600 text-xs italic">No streaming info available for your region.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isTV && movie.seasons && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-white font-bold text-xl uppercase tracking-tight">Episodes</h3>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">
                        {seasonDetails?.episodes?.length || 0} Episodes in Season {selectedSeason}
                      </p>
                    </div>
                    <CustomSelect
                      options={movie.seasons
                        .filter(s => s.season_number > 0)
                        .map(season => ({ 
                          value: season.season_number, 
                          label: `Season ${season.season_number}` 
                        }))}
                      value={selectedSeason}
                      onChange={(value) => setSelectedSeason(Number(value))}
                      placeholder="Select Season"
                      colorTheme="red"
                    />
                  </div>

                  {loadingSeason ? (
                    <div className="flex justify-center py-8">
                      <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-100 overflow-y-auto pr-2 custom-scrollbar">
                      {seasonDetails?.episodes?.map(episode => (
                        <div key={episode.id} className="bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group">
                          <div className="flex gap-4">
                            <div className="shrink-0 w-32 aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                              {episode.still_path ? (
                                <img 
                                  src={`${IMAGE_BASE_URL}${episode.still_path}`} 
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs uppercase font-black">No Image</div>
                              )}
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
                                EP {episode.episode_number}
                              </div>
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-white font-bold text-sm uppercase tracking-tight">{episode.name}</h4>
                                <div className="flex items-center gap-1 text-yellow-500 text-[10px] font-bold">
                                  <Star size={10} fill="currentColor" />
                                  <span>{episode.vote_average?.toFixed(1)}</span>
                                </div>
                              </div>
                              <p className="text-gray-400 text-xs leading-relaxed italic">
                                {episode.overview || "No overview available for this episode."}
                              </p>
                              <div className="flex items-center gap-3 pt-1">
                                <button className="flex items-center gap-1 text-red-500 hover:text-red-400 transition-colors">
                                  <Play size={10} fill="currentColor" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Play</span>
                                </button>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">
                                  {episode.runtime || (movie.episode_run_time && movie.episode_run_time[0]) || '--'} MIN
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">{episode.air_date}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {credits?.cast && credits.cast.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-xl uppercase tracking-tight border-l-4 border-red-600 pl-3">Top Cast</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {credits.cast.slice(0, 8).map(person => (
                      <div key={person.id} className="shrink-0 w-24 text-center space-y-2">
                        <img
                          src={person.profile_path ? `${POSTER_BASE_URL}${person.profile_path}` : 'https://via.placeholder.com/150x150?text=No+Image'}
                          className="w-24 h-24 object-cover rounded-full border-2 border-gray-800 hover:border-red-600 hover:scale-110 transition-all cursor-pointer shadow-lg"
                          alt={person.name}
                          referrerPolicy="no-referrer"
                        />
                        <p className="text-white text-xs font-bold truncate">{person.name}</p>
                        <p className="text-gray-500 text-[10px] truncate">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reviews.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-black text-xl uppercase tracking-tight border-l-4 border-red-600 pl-3">User Reviews</h3>
                  <div className="space-y-4">
                    {reviews.slice(0, 3).map(review => (
                      <div key={review.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">{review.author}</span>
                          {review.author_details?.rating && (
                            <div className="flex items-center gap-1 text-yellow-500 text-xs bg-yellow-500/20 px-2 py-1 rounded">
                              <Star size={12} fill="currentColor" />
                              <span className="font-bold">{review.author_details.rating}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-3 italic">"{review.content}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

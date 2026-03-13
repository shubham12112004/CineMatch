import React, { useState } from 'react';
import { X, Search, Star, Clock, Calendar, TrendingUp, Sparkles, BrainCircuit, MessageSquarePlus, User, Globe, Activity, Languages, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchFromTMDB, POSTER_BASE_URL } from '../services/tmdb';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

function getFallbackComparison(item1, item2, reason = '') {
  const title1 = item1.title || item1.name;
  const title2 = item2.title || item2.name;
  const type1 = item1.media_type === 'tv' ? 'TV Series' : 'Movie';
  const type2 = item2.media_type === 'tv' ? 'TV Series' : 'Movie';

  const rating1 = Number(item1.vote_average || 0);
  const rating2 = Number(item2.vote_average || 0);
  const pop1 = Number(item1.popularity || 0);
  const pop2 = Number(item2.popularity || 0);

  const winnerByRating = rating1 === rating2 ? 'Tie' : (rating1 > rating2 ? title1 : title2);
  const winnerByPopularity = pop1 === pop2 ? 'Tie' : (pop1 > pop2 ? title1 : title2);

  const formatRuntime = (item) => {
    if (item.media_type === 'tv') return `${item.episode_run_time?.[0] || 'N/A'} min/episode`;
    return `${item.runtime || 'N/A'} min`;
  };

  const shortReason = reason ? `\n\nNote: Gemini AI is unavailable right now (${reason}). This is a local smart fallback analysis.` : '';

  return `## Local Smart Comparison\n\n1. **Format & Scope**\n- **${title1}**: ${type1}\n- **${title2}**: ${type2}\n- Best for short commitment: **${(item1.media_type === 'movie' && item2.media_type !== 'movie') ? title1 : (item2.media_type === 'movie' && item1.media_type !== 'movie') ? title2 : 'Depends on preference'}**\n\n2. **Critical Reception**\n- **${title1}** rating: ${rating1.toFixed(1)}/10\n- **${title2}** rating: ${rating2.toFixed(1)}/10\n- Higher-rated pick: **${winnerByRating}**\n\n3. **Audience Momentum**\n- **${title1}** popularity: ${Math.round(pop1)}\n- **${title2}** popularity: ${Math.round(pop2)}\n- More currently trending: **${winnerByPopularity}**\n\n4. **Time Commitment**\n- **${title1}**: ${formatRuntime(item1)}\n- **${title2}**: ${formatRuntime(item2)}\n\n5. **Quick Recommendation**\n- Pick **${title1}** if you want ${rating1 >= rating2 ? 'the stronger critical score and potentially better-crafted execution' : 'its particular vibe, cast, or format fit'}.\n- Pick **${title2}** if you want ${rating2 >= rating1 ? 'the stronger critical score and potentially better-crafted execution' : 'its particular vibe, cast, or format fit'}.\n\nUse **"Tell me more"** again after fixing Gemini key for a full AI deep-dive.${shortReason}`;
}

export default function CompareMovies({ onClose }) {
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [movie1, setMovie1] = useState(null);
  const [movie2, setMovie2] = useState(null);
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening1, setIsListening1] = useState(false);
  const [isListening2, setIsListening2] = useState(false);

  const startVoiceSearch = (setSearch, setResults, typeFilter, setIsListening) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearch(transcript);
      searchContent(transcript, setResults, typeFilter);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const searchContent = async (query, setResults, typeFilter = null) => {
    if (query.length < 3) return;
    try {
      const endpoint = typeFilter ? `search/${typeFilter}` : 'search/multi';
      const data = await fetchFromTMDB(endpoint, { query });
      
      let filtered = data.results;
      if (endpoint === 'search/multi') {
        filtered = data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv');
      } else {
        filtered = data.results.map(r => ({ ...r, media_type: typeFilter }));
      }
      
      setResults(filtered.slice(0, 5));
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const selectItem = async (item, setItem, setResults, setSearch) => {
    try {
      const isTV = item.media_type === 'tv';
      const [details, credits] = await Promise.all([
        fetchFromTMDB(`${isTV ? 'tv' : 'movie'}/${item.id}`),
        fetchFromTMDB(`${isTV ? 'tv' : 'movie'}/${item.id}/credits`)
      ]);
      setItem({ ...details, credits, media_type: isTV ? 'tv' : 'movie' });
      setResults([]);
      setSearch(details.title || details.name);
      setAiAnalysis(null);
    } catch (err) {
      console.error('Failed to fetch details', err);
    }
  };

  const generateAiComparison = async () => {
    if (!movie1 || !movie2) return;
    setIsAnalyzing(true);
    try {
      if (!GEMINI_API_KEY) {
        setAiAnalysis(getFallbackComparison(movie1, movie2, 'missing API key'));
        return;
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const model = "gemini-2.5-flash";
      
      const getItemInfo = (item) => {
        const isTV = item.media_type === 'tv';
        return `
        - Type: ${isTV ? 'TV Series' : 'Movie'}
        - Title: ${item.title || item.name}
        - Year: ${(item.release_date || item.first_air_date)?.split('-')[0]}
        - ${isTV ? 'Creator' : 'Director'}: ${isTV ? (item.created_by?.[0]?.name || 'N/A') : (item.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A')}
        - Cast: ${item.credits?.cast?.slice(0, 3).map(c => c.name).join(', ')}
        - Genres: ${item.genres?.map(g => g.name).join(', ')}
        - Tagline: ${item.tagline || 'N/A'}
        - Overview: ${item.overview}
        - ${isTV ? 'Seasons' : 'Status'}: ${isTV ? item.number_of_seasons : item.status}
        - Language: ${item.original_language}
        `;
      };

      const prompt = `Act as a world-class film and television critic. Compare these two pieces of content in extreme detail. Note that they might be different formats (Movie vs TV Show), so adjust your analysis to account for the different storytelling structures:
      
      CONTENT 1:
      ${getItemInfo(movie1)}
      
      CONTENT 2:
      ${getItemInfo(movie2)}
      
      Structure your response as follows:
      1. **Cinematic Style & Narrative Structure**: Compare the visual language, directorial/creative style, and how the story is paced (e.g., a 2-hour arc vs. multi-season development).
      2. **AI Preference & Recommendation**: Provide a definitive recommendation for different types of viewers. Explain EXACTLY WHY one is better for a specific mood or time commitment. 
         - For example: "Watch ${movie1.title || movie1.name} if you want a complete, self-contained emotional journey, but choose ${movie2.title || movie2.name} if you want a deep, expanding world to inhabit over time."
      3. **The Verdict**: Which one offers a more profound experience or superior craftsmanship in its respective format?
      4. **Deep Dive Offer**: End by explicitly offering to provide more information on similar content, specific creators, or the evolution of these genres.
      
      Tone: Sophisticated, passionate, and highly informative. Use Markdown.`;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      setAiAnalysis(response.text);
    } catch (err) {
      console.error('AI Analysis failed', err);
      const reason = String(err?.message || err || 'unknown error').toLowerCase().includes('api key')
        ? 'invalid API key'
        : 'service/network issue';
      setAiAnalysis(getFallbackComparison(movie1, movie2, reason));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 bg-[#0a0a0a]/98 backdrop-blur-xl flex flex-col p-4 md:p-12 overflow-y-auto custom-scrollbar"
    >
      <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <BrainCircuit className="text-red-600" size={32} />
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Cinematic Duel</h1>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
          <X size={32} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto w-full">
        {/* Slot 1 */}
        <div className="space-y-6 relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={search1}
              onChange={(e) => { setSearch1(e.target.value); searchContent(e.target.value, setResults1, movie2?.media_type); }}
              placeholder={movie2 ? `Search ${movie2.media_type === 'tv' ? 'TV shows' : 'movies'}...` : "Search movie or TV show..."}
              className="w-full bg-white/5 border-2 border-white/10 p-4 pl-12 pr-12 rounded-2xl text-white font-bold uppercase tracking-widest focus:border-red-600 focus:bg-white/10 outline-none transition-all"
            />
            <button 
              onClick={() => startVoiceSearch(setSearch1, setResults1, movie2?.media_type, setIsListening1)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening1 ? 'text-red-600 animate-pulse' : 'text-gray-500 hover:text-white'}`}
            >
              <Mic size={20} />
            </button>
            <AnimatePresence mode="wait">
              {results1.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 z-50 bg-[#181818] border border-white/10 rounded-2xl mt-2 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  {results1.map(m => (
                    <button
                      key={m.id}
                      onClick={() => selectItem(m, setMovie1, setResults1, setSearch1)}
                      className="w-full p-4 text-left hover:bg-white/5 text-gray-300 font-bold uppercase tracking-widest text-xs border-b border-white/5 last:border-0 transition-colors"
                    >
                      <span className="text-red-500 mr-2">{m.media_type === 'tv' ? '[TV]' : '[MOVIE]'}</span>
                      {m.title || m.name} <span className="text-gray-500 ml-2">({(m.release_date || m.first_air_date)?.split('-')[0]})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {movie1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative group">
              <button 
                onClick={() => { setMovie1(null); setSearch1(''); }}
                className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-red-600 p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
              <div className="relative aspect-2/3 overflow-hidden rounded-2xl">
                <img src={`${POSTER_BASE_URL}${movie1.poster_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">{movie1.title || movie1.name}</h2>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 italic">{movie1.tagline}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Slot 2 */}
        <div className="space-y-6 relative">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={search2}
              onChange={(e) => { setSearch2(e.target.value); searchContent(e.target.value, setResults2, movie1?.media_type); }}
              placeholder={movie1 ? `Search ${movie1.media_type === 'tv' ? 'TV shows' : 'movies'}...` : "Search movie or TV show..."}
              className="w-full bg-white/5 border-2 border-white/10 p-4 pl-12 pr-12 rounded-2xl text-white font-bold uppercase tracking-widest focus:border-red-600 focus:bg-white/10 outline-none transition-all"
            />
            <button 
              onClick={() => startVoiceSearch(setSearch2, setResults2, movie1?.media_type, setIsListening2)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isListening2 ? 'text-red-600 animate-pulse' : 'text-gray-500 hover:text-white'}`}
            >
              <Mic size={20} />
            </button>
            <AnimatePresence mode="wait">
              {results2.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 z-50 bg-[#181818] border border-white/10 rounded-2xl mt-2 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                >
                  {results2.map(m => (
                    <button
                      key={m.id}
                      onClick={() => selectItem(m, setMovie2, setResults2, setSearch2)}
                      className="w-full p-4 text-left hover:bg-white/5 text-gray-300 font-bold uppercase tracking-widest text-xs border-b border-white/5 last:border-0 transition-colors"
                    >
                      <span className="text-red-500 mr-2">{m.media_type === 'tv' ? '[TV]' : '[MOVIE]'}</span>
                      {m.title || m.name} <span className="text-gray-500 ml-2">({(m.release_date || m.first_air_date)?.split('-')[0]})</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {movie2 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-6 shadow-2xl relative group">
              <button 
                onClick={() => { setMovie2(null); setSearch2(''); }}
                className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-red-600 p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={16} />
              </button>
              <div className="relative aspect-2/3 overflow-hidden rounded-2xl">
                <img src={`${POSTER_BASE_URL}${movie2.poster_path}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                   <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">{movie2.title || movie2.name}</h2>
                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 italic">{movie2.tagline}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {movie1 && movie2 && (
        <div className="max-w-7xl mx-auto w-full mt-16 space-y-12">
          {/* Comparison Table */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="p-6 text-gray-500 font-bold uppercase tracking-widest text-xs">Feature</th>
                  <th className="p-6 text-white font-black uppercase tracking-tighter text-xl">{movie1.title || movie1.name}</th>
                  <th className="p-6 text-white font-black uppercase tracking-tighter text-xl">{movie2.title || movie2.name}</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 font-bold uppercase tracking-widest text-sm">
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3">Type</td>
                  <td className="p-6 uppercase text-xs font-black text-red-500">{movie1.media_type}</td>
                  <td className="p-6 uppercase text-xs font-black text-red-500">{movie2.media_type}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Star size={18} className="text-yellow-500" /> Rating</td>
                  <td className={`p-6 ${movie1.vote_average > movie2.vote_average ? 'text-green-500' : ''}`}>
                    {movie1.vote_average?.toFixed(1)} / 10
                  </td>
                  <td className={`p-6 ${movie2.vote_average > movie1.vote_average ? 'text-green-500' : ''}`}>
                    {movie2.vote_average?.toFixed(1)} / 10
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><User size={18} className="text-red-500" /> {movie1.media_type === 'tv' ? 'Creator' : 'Director'}</td>
                  <td className="p-6">
                    {movie1.media_type === 'tv' 
                      ? (movie1.created_by?.[0]?.name || 'N/A')
                      : (movie1.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A')}
                  </td>
                  <td className="p-6">
                    {movie2.media_type === 'tv' 
                      ? (movie2.created_by?.[0]?.name || 'N/A')
                      : (movie2.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A')}
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Sparkles size={18} className="text-orange-500" /> Top Cast</td>
                  <td className="p-6 text-xs">{movie1.credits?.cast?.slice(0, 3).map(c => c.name).join(', ')}</td>
                  <td className="p-6 text-xs">{movie2.credits?.cast?.slice(0, 3).map(c => c.name).join(', ')}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Clock size={18} className="text-blue-500" /> {movie1.media_type === 'tv' ? 'Avg. Runtime' : 'Runtime'}</td>
                  <td className="p-6">
                    {movie1.media_type === 'tv' 
                      ? (movie1.episode_run_time?.[0] || '--') 
                      : movie1.runtime} min
                  </td>
                  <td className="p-6">
                    {movie2.media_type === 'tv' 
                      ? (movie2.episode_run_time?.[0] || '--') 
                      : movie2.runtime} min
                  </td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Calendar size={18} className="text-green-500" /> Year</td>
                  <td className="p-6">{(movie1.release_date || movie1.first_air_date)?.split('-')[0]}</td>
                  <td className="p-6">{(movie2.release_date || movie2.first_air_date)?.split('-')[0]}</td>
                </tr>
                { (movie1.media_type === 'tv' || movie2.media_type === 'tv') && (
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-6 flex items-center gap-3">📺 Seasons / Episodes</td>
                    <td className="p-6">
                      {movie1.media_type === 'tv' ? `${movie1.number_of_seasons}S / ${movie1.number_of_episodes}E` : 'N/A'}
                    </td>
                    <td className="p-6">
                      {movie2.media_type === 'tv' ? `${movie2.number_of_seasons}S / ${movie2.number_of_episodes}E` : 'N/A'}
                    </td>
                  </tr>
                )}
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><TrendingUp size={18} className="text-purple-500" /> Popularity</td>
                  <td className="p-6">{Math.round(movie1.popularity)}</td>
                  <td className="p-6">{Math.round(movie2.popularity)}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Globe size={18} className="text-blue-400" /> Language</td>
                  <td className="p-6 uppercase">{movie1.original_language}</td>
                  <td className="p-6 uppercase">{movie2.original_language}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Languages size={18} className="text-indigo-400" /> Spoken</td>
                  <td className="p-6 text-xs">{movie1.spoken_languages?.map(l => l.english_name).join(', ')}</td>
                  <td className="p-6 text-xs">{movie2.spoken_languages?.map(l => l.english_name).join(', ')}</td>
                </tr>
                <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6 flex items-center gap-3"><Activity size={18} className="text-emerald-400" /> Status</td>
                  <td className="p-6">{movie1.status}</td>
                  <td className="p-6">{movie2.status}</td>
                </tr>
                { (movie1.media_type === 'movie' && movie2.media_type === 'movie') && (
                  <>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-6 flex items-center gap-3">💰 Budget</td>
                      <td className="p-6">{formatCurrency(movie1.budget)}</td>
                      <td className="p-6">{formatCurrency(movie2.budget)}</td>
                    </tr>
                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-6 flex items-center gap-3">📈 Revenue</td>
                      <td className="p-6">{formatCurrency(movie1.revenue)}</td>
                      <td className="p-6">{formatCurrency(movie2.revenue)}</td>
                    </tr>
                  </>
                )}
                <tr className="hover:bg-white/5 transition-colors">
                  <td className="p-6">Genres</td>
                  <td className="p-6 text-xs">{movie1.genres?.map(g => g.name).join(', ')}</td>
                  <td className="p-6 text-xs">{movie2.genres?.map(g => g.name).join(', ')}</td>
                </tr>
              </tbody>
            </table>
          </motion.div>

          {/* AI Analysis Trigger */}
          <div className="flex justify-center">
            {!aiAnalysis && !isAnalyzing && (
              <button 
                onClick={generateAiComparison}
                className="group relative px-12 py-5 bg-red-600 rounded-full font-black text-xl uppercase tracking-widest text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_50px_rgba(220,38,38,0.6)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
              >
                <Sparkles className="animate-pulse" />
                Generate AI Verdict
              </button>
            )}
          </div>

          {/* AI Analysis Content */}
          <AnimatePresence mode="wait">
            {(isAnalyzing || aiAnalysis) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
                
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-6">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 font-black uppercase tracking-widest animate-pulse">AI is analyzing the cinematic data...</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 text-red-600">
                      <BrainCircuit size={32} />
                      <h3 className="text-2xl font-black uppercase tracking-tighter">AI Cinematic Analysis</h3>
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                      {aiAnalysis}
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3 text-gray-400 font-bold uppercase tracking-widest text-xs">
                        <MessageSquarePlus size={18} className="text-red-600" />
                        Want to dive deeper into this genre?
                      </div>
                      <button 
                        onClick={() => {
                          setAiAnalysis(null);
                          generateAiComparison();
                        }}
                        disabled={isAnalyzing}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Tell me more'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

const API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const BASE_URL = API_URL ? `${API_URL}/api/tmdb` : '/api/tmdb';

console.log('API URL:', import.meta.env.VITE_API_URL);
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn('VITE_API_URL is missing in production. Requests may fail if frontend and backend are hosted separately.');
}

export const fetchFromTMDB = async (endpoint, params = {}, retries = 3) => {
  const queryParams = new URLSearchParams(params);
  const url = `${BASE_URL}/${endpoint}?${queryParams.toString()}`;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`TMDB Error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeout);
      
      if (attempt === retries) {
        console.error(`❌ TMDB fetch failed after ${retries} attempts:`, endpoint, error.message);
        // Return empty result instead of throwing
        return { results: [], error: error.message };
      }
      
      console.warn(`⚠️ TMDB fetch attempt ${attempt}/${retries} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
    }
  }
};

export const getTrendingMovies = () => fetchFromTMDB('trending/movie/day');
export const getTopRatedMovies = () => fetchFromTMDB('movie/top_rated');
export const getPopularTV = () => fetchFromTMDB('tv/popular');
export const getMoviesByGenre = (genreId) => fetchFromTMDB('discover/movie', { with_genres: genreId });
export const getMovieDetails = (id) => fetchFromTMDB(`movie/${id}`);
export const getMovieVideos = (id) => fetchFromTMDB(`movie/${id}/videos`);
export const getMovieCredits = (id) => fetchFromTMDB(`movie/${id}/credits`);
export const getMovieReviews = (id) => fetchFromTMDB(`movie/${id}/reviews`);
export const getMovieWatchProviders = (id) => fetchFromTMDB(`movie/${id}/watch/providers`);
export const getTVDetails = (id) => fetchFromTMDB(`tv/${id}`);
export const getTVVideos = (id) => fetchFromTMDB(`tv/${id}/videos`);
export const getTVCredits = (id) => fetchFromTMDB(`tv/${id}/credits`);
export const getTVReviews = (id) => fetchFromTMDB(`tv/${id}/reviews`);
export const getTVWatchProviders = (id) => fetchFromTMDB(`tv/${id}/watch/providers`);
export const getTVSeasonDetails = (id, seasonNumber) => fetchFromTMDB(`tv/${id}/season/${seasonNumber}`);

export const discoverContent = (params) => fetchFromTMDB('discover/movie', params);
export const discoverTV = (params) => fetchFromTMDB('discover/tv', params);

export const searchPerson = (query) => fetchFromTMDB('search/person', { query });
export const getPopularPeople = (page = 1) => fetchFromTMDB('person/popular', { page });
export const getPersonCombinedCredits = (id) => fetchFromTMDB(`person/${id}/combined_credits`);

export const MOOD_GENRES = {
  'Happy': 35, // Comedy
  'Sad': 18, // Drama
  'Exciting': 28, // Action
  'Relaxing': 10751, // Family
  'Thought-provoking': 9648, // Mystery
  'Scary': 27, // Horror
  'Romantic': 10749, // Romance
  'Dark': 53, // Thriller
  'Adventurous': 12, // Adventure
  'Inspiring': 36, // History
  'Mind-bending': 878, // Science Fiction
};

export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/original';
export const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const GENRE_MAP = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

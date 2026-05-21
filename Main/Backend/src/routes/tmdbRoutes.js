import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeout = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export function createTmdbRouter(tmdbApiKey) {
  const router = Router();

  router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });

  const buildTmdbUrl = (endpoint, query) => {
    const queryParams = new URLSearchParams(query);
    queryParams.set('api_key', tmdbApiKey);
    return `https://api.themoviedb.org/3/${endpoint}?${queryParams.toString()}`;
  };

  const proxyTmdb = async (endpoint, query, res) => {
    const url = buildTmdbUrl(endpoint, query);
    const maxAttempts = 3;

    for (let attempts = 1; attempts <= maxAttempts; attempts += 1) {
      try {
        const response = await fetchWithTimeout(url);
        const data = await response.json();

        if (!response.ok) {
          return res.status(response.status).json(data);
        }

        return res.json(data);
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.error(`❌ TMDB API Error (after ${attempts} attempts):`, error.message);

          // Try to serve a local fallback/mock response for development
          try {
            const fallbackPath = path.resolve(__dirname, '..', 'state', 'tmdb_fallback.json');
            if (fs.existsSync(fallbackPath)) {
              const raw = fs.readFileSync(fallbackPath, 'utf8');
              const mock = JSON.parse(raw);
              console.warn('⚠️ Serving TMDB fallback mock response from', fallbackPath);
              return res.json(Object.assign({}, mock, { _mock: true }));
            }
          } catch (fsErr) {
            console.warn('⚠️ Failed to load TMDB fallback mock:', fsErr.message || fsErr);
          }

          return res.status(500).json({ error: 'Failed to fetch from TMDB. Check your internet connection.' });
        }

        console.warn(`⚠️  TMDB API attempt ${attempts}/${maxAttempts} failed, retrying...`);
        await sleep(1000 * attempts);
      }
    }

    return res.status(500).json({ error: 'TMDB proxy failed unexpectedly' });
  };

  // Friendly default so /api/tmdb returns movie JSON instead of TMDB 404 for empty endpoint.
  router.get('/', async (req, res) => {
    if (!tmdbApiKey) {
      return res.status(500).json({ error: 'TMDB_API_KEY is not configured' });
    }

    return proxyTmdb('discover/movie', req.query, res);
  });

  router.get('/*', async (req, res) => {
    if (!tmdbApiKey) {
      return res.status(500).json({ error: 'TMDB_API_KEY is not configured' });
    }

    const endpoint = req.params[0];
    return proxyTmdb(endpoint, req.query, res);
  });

  return router;
}

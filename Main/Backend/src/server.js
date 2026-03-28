import express from 'express';
import passport from 'passport';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDatabase, isMongoConnected } from './config/database.js';
import {
  APP_URL,
  CORS_ORIGINS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  HOST,
  JWT_SECRET,
  MONGODB_URI,
  NODE_ENV,
  REQUESTED_PORT,
  TMDB_API_KEY
} from './config/env.js';

import { verifyToken } from './middleware/authMiddleware.js';
import { createAuthRouter } from './routes/authRoutes.js';
import { createTmdbRouter } from './routes/tmdbRoutes.js';
import { User } from './schemas/userSchema.js';
import { findAvailablePort } from './utils/findAvailablePort.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..');
const frontendRoot = path.resolve(backendRoot, '..', 'Frontend');
const productionDist = path.resolve(backendRoot, 'dist');

async function startServer() {

  const app = express();
  const port = process.env.PORT || await findAvailablePort(REQUESTED_PORT, HOST);

  const baseAllowedOrigins = [
    APP_URL,
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    ...CORS_ORIGINS,
  ].filter(Boolean);

  const isOriginAllowed = (origin) => {
    if (!origin) return true;
    if (baseAllowedOrigins.includes(origin)) return true;

    // Allow Vercel preview deployments like https://project-git-branch-user.vercel.app
    if (origin.endsWith('.vercel.app')) return true;

    return false;
  };

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (isOriginAllowed(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });

  app.use(express.json());
  app.use(passport.initialize());

  app.use('/api', (req, res, next) => {
    const start = Date.now();
    const origin = req.headers.origin || 'no-origin';

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms) origin=${origin}`);
    });

    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'CineMatch Backend',
      env: NODE_ENV,
      mongoConnected: isMongoConnected(),
      tmdbConfigured: Boolean(TMDB_API_KEY),
      appUrl: APP_URL,
      timestamp: new Date().toISOString(),
    });
  });

  /* ---------------- DATABASE ---------------- */

  await connectDatabase(MONGODB_URI);

  /* ---------------- API ROUTES ---------------- */

  app.use('/api/auth', createAuthRouter({
    User,
    jwtSecret: JWT_SECRET,
    isMongoConnected,
    verifyToken: verifyToken(JWT_SECRET),
    googleClientId: GOOGLE_CLIENT_ID,
    googleClientSecret: GOOGLE_CLIENT_SECRET,
    appUrl: APP_URL
  }));

  app.use('/api/tmdb', createTmdbRouter(TMDB_API_KEY));

  /* ---------------- DEVELOPMENT (LOCAL) ---------------- */

  if (NODE_ENV !== 'production') {

    process.env.DISABLE_HMR = 'true';

    const hmrPort = await findAvailablePort(24678, HOST);

    const vite = await createViteServer({
      configFile: path.resolve(frontendRoot, 'vite.config.js'),
      root: frontendRoot,
      server: {
        middlewareMode: true,
        hmr: {
          port: hmrPort,
          host: 'localhost'
        }
      },
      appType: 'spa',
      logLevel: 'error'
    });

    app.use(vite.middlewares);

  } 
  /* ---------------- PRODUCTION ---------------- */

  else {

    console.log('🚀 Running in production mode');

    const indexPath = path.join(productionDist, 'index.html');

    if (fs.existsSync(indexPath)) {

      app.use(express.static(productionDist));

      app.get('*', (req, res) => {
        res.sendFile(indexPath);
      });

    } else {

      console.log('⚠️ Frontend build not found. Serving API only.');

      app.get('/', (req, res) => {
        res.json({
          status: "CineMatch API running",
          endpoints: ["/api/auth", "/api/tmdb"]
        });
      });

    }
  }

  /* ---------------- START SERVER ---------------- */

  app.listen(port, HOST, () => {

    const green = '\x1b[32m';
    const blue = '\x1b[34m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const underline = '\x1b[4m';

    const publicUrl =
      process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

    console.log(`\n${green}${bold}✅ Server running successfully!${reset}`);
    console.log(`\n${bold}🎬 CineMatch API is ready!${reset}`);
    console.log(`\n${bold}Access it at:${reset}`);
    console.log(`${blue}${underline}${publicUrl}${reset}\n`);

  });

}

/* ---------------- ERROR HANDLER ---------------- */

startServer().catch((err) => {
  console.error('❌ Server startup failed:', err);
  process.exit(1);
});
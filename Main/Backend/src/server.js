import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDatabase, isMongoConnected } from './config/database.js';
import { HOST, JWT_SECRET, MONGODB_URI, NODE_ENV, REQUESTED_PORT, TMDB_API_KEY } from './config/env.js';
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
  const port = await findAvailablePort(REQUESTED_PORT, HOST);

  app.use(express.json());

  await connectDatabase(MONGODB_URI);

  app.use('/api/auth', createAuthRouter({
    User,
    jwtSecret: JWT_SECRET,
    isMongoConnected,
    verifyToken: verifyToken(JWT_SECRET),
  }));
  app.use('/api/tmdb', createTmdbRouter(TMDB_API_KEY));

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
          host: 'localhost',
        },
      },
      appType: 'spa',
      logLevel: 'error',
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(productionDist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(productionDist, 'index.html'));
    });
  }

  app.listen(port, HOST, () => {
    const blue = '\x1b[34m';
    const green = '\x1b[32m';
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const underline = '\x1b[4m';
    const localUrl = `http://localhost:${port}`;

    console.log(`\n${green}${bold}✅ Server running successfully!${reset}`);
    if (port !== REQUESTED_PORT) {
      console.log(`\n\x1b[33m⚠️  Port ${REQUESTED_PORT} was busy. Using port ${port} instead.${reset}`);
    }
    console.log(`\n${bold}🎬 CineMatch is ready!${reset}`);
    console.log(`\n${bold}Open your browser at:${reset}`);
    console.log(`${blue}${underline}${localUrl}${reset}\n`);
    console.log(`${bold}Or click the link above ☝️${reset}\n`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});

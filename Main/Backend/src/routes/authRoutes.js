import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { getMemoryUserByEmail, hasMemoryUser, saveMemoryUser } from '../state/memoryStore.js';
import { resolveMemoryUser } from '../middleware/authMiddleware.js';

function makeMemoryUser(name, email, hashedPassword) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    password: hashedPassword,
    myList: [],
    createdAt: new Date(),
  };
}

function makeGoogleMemoryUser(profile, email, hashedPassword) {
  return {
    id: `google-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: profile.displayName || email.split('@')[0],
    email,
    password: hashedPassword,
    myList: [],
    createdAt: new Date(),
    profile: {
      avatarUrl: profile.photos?.[0]?.value || '',
      bio: '',
      location: '',
    },
    auth: {
      provider: 'google',
      googleId: profile.id || '',
      lastLoginAt: new Date(),
    },
  };
}

function serializeUser(user) {
  return {
    id: user._id?.toString?.() || user.id,
    name: user.name,
    email: user.email,
    myList: user.myList || [],
    profile: user.profile || {},
    auth: user.auth || {},
  };
}

function buildFrontendRedirect(req, params) {
  const url = new URL(`${req.protocol}://${req.get('host')}/`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function createAuthRouter({ User, jwtSecret, isMongoConnected, verifyToken, googleClientId, googleClientSecret, appUrl }) {
  const router = Router();
  const googleAuthEnabled = Boolean(googleClientId && googleClientSecret && appUrl);

  if (googleAuthEnabled && !passport._strategies.google) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: `${String(appUrl).replace(/\/$/, '')}/api/auth/google/callback`,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = String(profile.emails?.[0]?.value || '').trim().toLowerCase();

            if (!email) {
              return done(new Error('No email address returned from Google.'));
            }

            if (!isMongoConnected()) {
              const randomPassword = await bcryptjs.hash(`google-${profile.id}-${Date.now()}`, 10);
              const existingMemoryUser = getMemoryUserByEmail(email);

              if (existingMemoryUser) {
                existingMemoryUser.name = existingMemoryUser.name || profile.displayName || email.split('@')[0];
                existingMemoryUser.profile = {
                  ...(existingMemoryUser.profile || {}),
                  avatarUrl: existingMemoryUser.profile?.avatarUrl || profile.photos?.[0]?.value || '',
                };
                existingMemoryUser.auth = {
                  ...(existingMemoryUser.auth || {}),
                  provider: 'google',
                  googleId: profile.id || '',
                  lastLoginAt: new Date(),
                };

                saveMemoryUser(existingMemoryUser);
                return done(null, serializeUser(existingMemoryUser));
              }

              const memoryUser = saveMemoryUser(makeGoogleMemoryUser(profile, email, randomPassword));
              return done(null, serializeUser(memoryUser));
            }

            let user = await User.findOne({
              $or: [
                { email },
                { 'auth.googleId': profile.id || '__missing_google_id__' },
              ],
            });

            if (!user) {
              const generatedPassword = await bcryptjs.hash(`google-${profile.id}-${Date.now()}`, 10);
              user = new User({
                name: profile.displayName || email.split('@')[0],
                email,
                password: generatedPassword,
                profile: {
                  avatarUrl: profile.photos?.[0]?.value || '',
                  bio: '',
                  location: '',
                },
                auth: {
                  provider: 'google',
                  googleId: profile.id || '',
                  lastLoginAt: new Date(),
                },
              });
            } else {
              user.name = user.name || profile.displayName || email.split('@')[0];
              user.profile = {
                ...(user.profile?.toObject?.() || user.profile || {}),
                avatarUrl: user.profile?.avatarUrl || profile.photos?.[0]?.value || '',
              };
              user.auth = {
                ...(user.auth?.toObject?.() || user.auth || {}),
                provider: user.auth?.provider || 'google',
                googleId: profile.id || user.auth?.googleId || '',
                lastLoginAt: new Date(),
              };
            }

            await user.save();
            return done(null, serializeUser(user));
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  router.post('/register', async (req, res) => {
    try {
      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const { password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const hashedPassword = await bcryptjs.hash(password, 10);

      if (!isMongoConnected()) {
        if (hasMemoryUser(email)) {
          return res.status(400).json({ error: 'Email already registered' });
        }

        const memoryUser = saveMemoryUser(makeMemoryUser(name, email, hashedPassword));
        const token = jwt.sign({ userId: memoryUser.id, email: memoryUser.email }, jwtSecret, { expiresIn: '7d' });

        return res.status(201).json({
          token,
          user: { id: memoryUser.id, name: memoryUser.name, email: memoryUser.email, myList: memoryUser.myList },
          mode: 'memory-fallback',
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const user = new User({ name, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: '7d' });
      return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const { password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (!isMongoConnected()) {
        const memoryUser = getMemoryUserByEmail(email);
        if (!memoryUser) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcryptjs.compare(password, memoryUser.password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: memoryUser.id, email: memoryUser.email }, jwtSecret, { expiresIn: '7d' });
        return res.json({
          token,
          user: { id: memoryUser.id, name: memoryUser.name, email: memoryUser.email, myList: memoryUser.myList },
          mode: 'memory-fallback',
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await bcryptjs.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/me', verifyToken, async (req, res) => {
    try {
      if (!isMongoConnected()) {
        const memoryUser = resolveMemoryUser(req);
        if (!memoryUser) {
          return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
          user: {
            id: memoryUser.id,
            name: memoryUser.name,
            email: memoryUser.email,
            myList: memoryUser.myList,
            createdAt: memoryUser.createdAt,
          },
          mode: 'memory-fallback',
        });
      }

      const user = await User.findById(req.userId).select('-password');
      return res.json({ user });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/google', (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.status(503).json({ error: 'Google sign-in is not configured on the server.' });
    }

    return passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      prompt: 'select_account',
    })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    if (!googleAuthEnabled) {
      return res.redirect(buildFrontendRedirect(req, {
        showAuth: '1',
        authError: 'Google sign-in is not configured on the server.',
      }));
    }

    return passport.authenticate('google', { session: false }, (error, user) => {
      if (error || !user) {
        return res.redirect(buildFrontendRedirect(req, {
          showAuth: '1',
          authError: error?.message || 'Google sign-in failed. Please try again.',
        }));
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, jwtSecret, { expiresIn: '7d' });
      const encodedUser = Buffer.from(JSON.stringify(user)).toString('base64url');

      return res.redirect(buildFrontendRedirect(req, {
        auth: 'google',
        token,
        user: encodedUser,
      }));
    })(req, res, next);
  });

  return router;
}

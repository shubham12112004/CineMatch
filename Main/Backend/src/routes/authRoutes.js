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

/*
  FIXED:
  Redirect should go to FRONTEND (Vercel)
*/
function buildFrontendRedirect(req, params) {
  const url = new URL(process.env.APP_URL || "https://cine-match-coral.vercel.app");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
}

export function createAuthRouter({
  User,
  jwtSecret,
  isMongoConnected,
  verifyToken,
  googleClientId,
  googleClientSecret
}) {

  const router = Router();
  const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);

  if (googleAuthEnabled && !passport._strategies.google) {

    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,

          /*
            FIXED:
            Callback must go to BACKEND (Render)
          */
          callbackURL: "https://cinematch-6s53.onrender.com/api/auth/google/callback",

        },

        async (_accessToken, _refreshToken, profile, done) => {
          try {

            const email = String(profile.emails?.[0]?.value || '')
              .trim()
              .toLowerCase();

            if (!email) {
              return done(new Error('No email address returned from Google.'));
            }

            if (!isMongoConnected()) {

              const randomPassword =
                await bcryptjs.hash(`google-${profile.id}-${Date.now()}`, 10);

              const existingMemoryUser = getMemoryUserByEmail(email);

              if (existingMemoryUser) {

                existingMemoryUser.name =
                  existingMemoryUser.name ||
                  profile.displayName ||
                  email.split('@')[0];

                existingMemoryUser.profile = {
                  ...(existingMemoryUser.profile || {}),
                  avatarUrl:
                    existingMemoryUser.profile?.avatarUrl ||
                    profile.photos?.[0]?.value ||
                    '',
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

              const memoryUser =
                saveMemoryUser(
                  makeGoogleMemoryUser(profile, email, randomPassword)
                );

              return done(null, serializeUser(memoryUser));
            }

            let user = await User.findOne({
              $or: [
                { email },
                { 'auth.googleId': profile.id || '__missing_google_id__' },
              ],
            });

            if (!user) {

              const generatedPassword =
                await bcryptjs.hash(`google-${profile.id}-${Date.now()}`, 10);

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

              user.name =
                user.name ||
                profile.displayName ||
                email.split('@')[0];

              user.profile = {
                ...(user.profile?.toObject?.() || user.profile || {}),
                avatarUrl:
                  user.profile?.avatarUrl ||
                  profile.photos?.[0]?.value ||
                  '',
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

  router.get('/google', (req, res, next) => {

    if (!googleAuthEnabled) {
      return res.status(503).json({
        error: 'Google sign-in is not configured on the server.'
      });
    }

    return passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
      prompt: 'select_account',
    })(req, res, next);

  });

  router.get('/google/callback', (req, res, next) => {

    return passport.authenticate(
      'google',
      { session: false },

      (error, user) => {

        if (error || !user) {

          return res.redirect(
            buildFrontendRedirect(req, {
              showAuth: '1',
              authError: error?.message ||
                'Google sign-in failed. Please try again.'
            })
          );
        }

        const token =
          jwt.sign(
            { userId: user.id, email: user.email },
            jwtSecret,
            { expiresIn: '7d' }
          );

        const encodedUser =
          Buffer.from(JSON.stringify(user))
            .toString('base64url');

        return res.redirect(
          buildFrontendRedirect(req, {
            auth: 'google',
            token,
            user: encodedUser,
          })
        );
      }

    )(req, res, next);

  });

  return router;
}
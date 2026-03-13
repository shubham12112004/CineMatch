import { Router } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
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

export function createAuthRouter({ User, jwtSecret, isMongoConnected, verifyToken }) {
  const router = Router();

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

  return router;
}

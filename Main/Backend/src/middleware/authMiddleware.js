import jwt from 'jsonwebtoken';
import { getMemoryUserById, getMemoryUserByEmail, normalizeEmail } from '../state/memoryStore.js';

export function verifyToken(jwtSecret) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

export function resolveMemoryUser(req) {
  return getMemoryUserByEmail(normalizeEmail(req.userEmail)) || getMemoryUserById(req.userId);
}

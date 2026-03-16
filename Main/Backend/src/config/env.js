import dotenv from 'dotenv';

dotenv.config();

export const HOST = '0.0.0.0';
export const REQUESTED_PORT = Number(process.env.PORT) || 3000;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinematch';
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const APP_URL = process.env.APP_URL || `http://localhost:${REQUESTED_PORT}`;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';

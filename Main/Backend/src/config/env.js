import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendRoot = path.resolve(__dirname, '..', '..');
const workspaceRoot = path.resolve(backendRoot, '..');

const envFiles = [
	path.join(workspaceRoot, '.env'),
	path.join(backendRoot, '.env')
];

for (const envPath of envFiles) {
	if (fs.existsSync(envPath)) {
		dotenv.config({ path: envPath });
	}
}

export const HOST = '0.0.0.0';
export const REQUESTED_PORT = Number(process.env.PORT) || 3000;
export const TMDB_API_KEY = process.env.TMDB_API_KEY;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cinematch';
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
export const APP_URL = process.env.APP_URL || `http://localhost:${REQUESTED_PORT}`;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGINS = (process.env.CORS_ORIGINS || '')
	.split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

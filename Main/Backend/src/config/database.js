import mongoose from 'mongoose';

export async function connectDatabase(mongoUri) {
  try {
    await mongoose.connect(mongoUri);
    console.log('\x1b[32m✅ MongoDB connected successfully\x1b[0m');
  } catch (err) {
    console.warn('\x1b[33m⚠️  MongoDB connection failed. Running without database:\x1b[0m', err.message);
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

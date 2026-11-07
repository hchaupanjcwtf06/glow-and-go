import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      '[MongoDB] MONGODB_URI environment variable is not set. Database operations will be unavailable.'
    );
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection error: ${err.message}`);
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}


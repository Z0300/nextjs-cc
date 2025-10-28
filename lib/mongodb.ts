import mongoose from 'mongoose';

// Define the connection type for caching
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend the global namespace to include mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

// Validate that the MongoDB URI is defined
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// Initialize cache object to store connection
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

// Store cache in global scope to persist across hot reloads in development
if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Establishes a connection to MongoDB using Mongoose
 * Implements connection caching to prevent multiple connections during development
 * @returns Promise resolving to the Mongoose instance
 */
async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Return existing connection promise if one is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable command buffering for better error handling
    };

    // Create new connection promise
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection and cache it
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear promise on error to allow retry
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;

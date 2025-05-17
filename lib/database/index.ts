'use server';

import mongoose, { Connection } from 'mongoose';
import { handleError } from '../utils';

declare global {
  var mongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI;
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cached = global.mongoose || { conn: null, promise: null };

if (process.env.NODE_ENV !== 'production') {
  global.mongoose = cached;
}

async function createConnection(retryCount = 0): Promise<Connection> {
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI is required but not provided');
  }

  const opts = {
    bufferCommands: false,
    autoIndex: process.env.NODE_ENV !== 'production', // Don't build indexes in production
    maxPoolSize: 10,
    minPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    family: 4, // Use IPv4, skip trying IPv6
    heartbeatFrequencyMS: 10000,
    keepAlive: true,
    retryWrites: true,
    connectTimeoutMS: 30000,
  };

  try {
    const connection = await mongoose.createConnection(MONGODB_URI, opts).asPromise();

    // Connection event handlers
    connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      handleError({ 
        name: 'MongooseError',
        message: 'Database connection error',
        stack: err.stack
      });
    });

    connection.on('disconnected', async () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
      cached.conn = null;
      cached.promise = null;
      // Attempt to reconnect
      await connectToDatabase();
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await connection.close();
      process.exit(0);
    });

    return connection;
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection attempt ${retryCount + 1} of ${MAX_RETRIES}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      return createConnection(retryCount + 1);
    }
    throw error;
  }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4,
      heartbeatFrequencyMS: 10000,
      keepAlive: true,
      retryWrites: true,
      connectTimeoutMS: 30000,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose.connection;
      })
      .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const conn = await connectToDatabase();
    const adminDb = conn.db.admin();
    const result = await adminDb.ping();
    return { status: 'healthy', ping: result.ok === 1 };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
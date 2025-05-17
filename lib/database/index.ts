'use server';

import mongoose, { Connection } from 'mongoose';
import { handleError, ErrorType } from '../utils';

export const runtime = 'nodejs';

const MONGODB_URI = process.env.MONGODB_URI;
const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

interface CachedConnection {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

let cached: CachedConnection = (global as any).mongoose || { conn: null, promise: null };

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
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

export const connectToDatabase = async () => {
  if (process.env.NODE_ENV === 'development') {
    // Set mongoose debug mode only in development
    mongoose.set('debug', true);
  }

  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      cached.promise = createConnection();
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    const errorResponse = handleError({
      name: 'MongooseError',
      message: 'Failed to establish database connection',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(errorResponse.message);
  }
}

// Health check function
export const checkDatabaseHealth = async () => {
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
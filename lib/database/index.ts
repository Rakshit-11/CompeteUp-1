'use server';

import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(); // Uses the database specified in the MONGODB_URI

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const { client } = await connectToDatabase();
    const result = await client.db().admin().ping();
    return { status: 'healthy', ping: result.ok === 1 };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
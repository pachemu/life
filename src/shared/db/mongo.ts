import { Collection, Db, MongoClient } from 'mongodb';
import type { Document } from 'mongodb';
import { ENV } from '../env.js';
import { AppError } from '../errors.js';
import { HTTP_STATUSES } from '../HTTP_STATUSES.js';

const URL = ENV.MONGO_URL || 'mongodb://localhost:27017';
let client: MongoClient | null = null;
let db: Db | null;

export async function connectToDatabase(dbName: string): Promise<void> {
  if (client && db) {
    return;
  }

  try {
    client = new MongoClient(URL);
    await client.connect();
    db = client.db(dbName);
    console.log('mongoDb connected to database:', dbName);
  } catch (error) {
    client = null;
    db = null;
    console.error('mongoDb couldnt connect, error:', error);
    throw error;
  }
}

export function getDb<T extends Document>(name: string): Collection<T> {
  if (!db) {
    throw new Error('Database not connected. Call connectToDatabase first.');
  }
  return db.collection<T>(name);
}

export async function disconnectToDatabase(): Promise<void> {
  if (!client) {
    return;
  }

  try {
    await client.close();
    console.log('disconnect mongoDb');
  } catch (error) {
    console.error('mongo db couldnt disconnect, error:', error);
    throw error;
  } finally {
    client = null;
    db = null;
  }
}

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';

let cachedClient;

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  return cachedClient.db(dbName);
}

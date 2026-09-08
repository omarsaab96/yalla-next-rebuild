import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';

let clientPromise;

export function hasMongoConfig() {
  return Boolean(uri);
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect().catch(async (error) => {
      await client.close().catch(() => {});
      clientPromise = undefined;
      throw error;
    });
  }

  const client = await clientPromise;
  return client.db(dbName);
}

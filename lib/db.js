// lib/db.js — MongoDB connection for Vercel serverless
// Does NOT cache failed connections (re-tries on next request)

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI environment variable is not set.');

const options = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS:         10000,
  socketTimeoutMS:          15000,
  maxPoolSize:              10,
  minPoolSize:              0,
  retryWrites:              true,
  w:                        'majority',
};

// Module-level client — reused across warm Lambda invocations
// We store the PROMISE so concurrent requests share the same connection attempt
let clientPromise = null;

function getClientPromise() {
  if (!clientPromise) {
    const client = new MongoClient(uri, options);
    clientPromise = client.connect().catch(err => {
      // On failure reset so the next request retries
      clientPromise = null;
      throw err;
    });
  }
  return clientPromise;
}

async function getDb() {
  const client = await getClientPromise();
  return client.db('aeaclub');
}

module.exports = { getDb };


import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise: Promise<MongoClient>

// In development, use a global variable so that the value is preserved across module reloads caused by HMR (Hot Module Replacement).
let globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>
}

async function connectToDb() {
  if (process.env.NODE_ENV === 'development') {
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
      await setupIndexes(await globalWithMongo._mongoClientPromise);
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
    await setupIndexes(await clientPromise);
  }
  return clientPromise;
}

async function setupIndexes(client: MongoClient) {
    const db = client.db();
    
    // Index for fetching tasks by date, sorted by importance and then by ID.
    // This covers the main query in `/api/tasks/route.ts`.
    await db.collection('tasks').createIndex(
      { date: 1, isImportant: -1, _id: 1 }, 
      { name: 'date_importance_id_idx' }
    );
  
    // Index for migrating tasks.
    // This covers the query in `/api/tasks/migrate/route.ts`.
    await db.collection('tasks').createIndex(
      { date: 1, completed: 1 }, 
      { name: 'date_completed_idx' }
    );

    console.log("Database indexes have been set up.");
}


export default connectToDb()

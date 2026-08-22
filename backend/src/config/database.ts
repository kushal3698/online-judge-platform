import mongoose from 'mongoose';
import { ENV } from './environment';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Attempt standard connection to MongoDB URI
    console.log('[DATABASE] Connecting to MongoDB at:', ENV.MONGO_URI);
    await mongoose.connect(ENV.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('[DATABASE] Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('[DATABASE] Local MongoDB instance not reachable, initializing embedded in-memory MongoDB engine...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('[DATABASE] Embedded in-memory MongoDB engine connected successfully at:', uri);
    } catch (fallbackErr) {
      console.error('[DATABASE] Fatal: Failed to initialize database fallback:', fallbackErr);
      process.exit(1);
    }
  }
};

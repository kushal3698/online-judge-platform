import mongoose from 'mongoose';
import { ENV } from './environment';

export const connectDatabase = async (): Promise<void> => {
  try {
    // Attempt standard connection to MongoDB URI
    console.log('[DATABASE] Connecting to MongoDB at:', ENV.MONGO_URI);
    await mongoose.connect(ENV.MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('[DATABASE] Connected to MongoDB successfully.');
  } catch (error) {
    console.warn('[DATABASE] Remote/Local MongoDB not connected. Running resilient file-persisted & in-memory operational store mode.');
  }
};

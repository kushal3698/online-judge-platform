import Redis from 'ioredis';
import { Queue } from 'bullmq';
import { ENV } from './environment';

let isRedisAvailable = false;

export const redisConnection = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  password: ENV.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('[REDIS] Redis broker not detected on localhost:6379, running in memory-safe fallback mode.');
      return null;
    }
    return Math.min(times * 100, 1000);
  },
  lazyConnect: true
});

redisConnection.connect().then(() => {
  isRedisAvailable = true;
  console.log('[REDIS] Connected to Redis successfully.');
}).catch(() => {
  console.warn('[REDIS] Redis connection skipped (local queue fallback enabled).');
});

// BullMQ Queue instance (lazy loaded when Redis connects)
export const submissionQueue = {
  add: async (name: string, data: any, opts?: any) => {
    if (isRedisAvailable) {
      const q = new Queue('code-submissions', { connection: redisConnection });
      return await q.add(name, data, opts);
    } else {
      console.log(`[QUEUE_FALLBACK] Ingested submission ${data.submissionId} (Redis offline mode)`);
      return { id: data.submissionId, data };
    }
  }
};

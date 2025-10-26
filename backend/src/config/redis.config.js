import { Redis } from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT, 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redisClient;

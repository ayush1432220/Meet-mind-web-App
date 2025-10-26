import redisClient from './redis.config.js';

// Re-use the ioredis connection for BullMQ
const bullMqConnection = {
  connection: redisClient,
};

export default bullMqConnection;

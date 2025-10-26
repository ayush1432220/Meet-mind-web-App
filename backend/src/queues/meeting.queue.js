import { Queue } from 'bullmq';
import bullMqConnection from '../config/bullmq.config.js';

// This queue will handle all post-meeting AI processing
export const meetingProcessingQueue = new Queue('meeting-processing', {
  ...bullMqConnection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if job fails
    backoff: {
      type: 'exponential',
      delay: 10000, // 10 seconds
    },
    removeOnComplete: true,
    removeOnFail: 1000, // Keep last 1000 failed jobs
  },
});

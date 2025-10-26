import 'dotenv/config';
import { Worker } from 'bullmq';
import bullMqConnection from '../config/bullmq.config.js';
import connectDB from '../config/db.config.js';
import { aiService } from '../api/services/ai.service.js';
import { taskService } from '../api/services/task.service.js';
import { Meeting } from '../api/models/meeting.model.js';
import { User } from '../api/models/user.model.js';
// Note: This worker runs in a separate process. It cannot access the `io` instance from `app.js`.
// To notify via socket, it needs its own connection to Socket.IO or use Redis Pub/Sub.
// For simplicity, this worker just updates the DB.

const processJob = async (job) => {
  const { meetingId, transcript, participants } = job.data;
  console.log(`[Worker] Processing job ${job.id} for meeting: ${meetingId}`);

  try {
    // 1. Call AI Service (e.g., Gemini)
    const aiResult = await aiService.generateSummaryAndTasks(transcript);
    
    // 2. Create tasks in DB
    const taskIds = await taskService.createTasksFromAI(
      aiResult.tasks, 
      meetingId,
      participants
    );

    // 3. Update the Meeting document
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      meetingId,
      {
        status: 'COMPLETED',
        summary: aiResult.summary,
        keyDecisions: aiResult.keyDecisions,
        actionItems: taskIds,
      },
      { new: true }
    );
    
    // TODO: Notify user.
    // The *best* way is to use Redis Pub/Sub. The worker publishes a message,
    // and the main `socket.handler.js` subscribes to it and emits to the client.
    // A simpler way (but less scalable) is for the worker to emit directly
    // if it has access to the `io` instance (which it doesn't here).
    
    // For now, we just log success. The client can poll or get update on next load.
    console.log(`[Worker] Job ${job.id} completed for meeting: ${meetingId}`);
    return updatedMeeting;

  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error);
    await Meeting.findByIdAndUpdate(meetingId, { status: 'ERROR' });
    throw error; // Throw error to trigger retry
  }
};

// --- Worker Setup ---
console.log('Connecting worker to database and queue...');

(async () => {
  try {
    await connectDB();
    
    const worker = new Worker(
      'meeting-processing', 
      processJob, 
      { 
        ...bullMqConnection,
        concurrency: 5 // Process 5 jobs at a time
      }
    );

    worker.on('completed', (job) => {
      console.log(`[Worker] Job ${job.id} has completed.`);
    });

    worker.on('failed', (job, err) => {
      console.error(`[Worker] Job ${job.id} has failed with ${err.message}`);
    });

    console.log('Meeting worker started and listening for jobs...');
    
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
})();

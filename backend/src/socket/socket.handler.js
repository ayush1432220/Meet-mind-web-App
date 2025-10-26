import { Server } from 'socket.io';
import { User } from '../api/models/user.model.js';
import { Meeting } from '../api/models/meeting.model.js';
import redisClient from '../config/redis.config.js';
import { ApiError } from '../api/utils/apiError.js';

// This map stores speaker start times { meetingId: { userId: startTime } }
const speakerTimers = new Map();

export const initSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // --- Socket.IO Middleware (for auth) ---
  // This is a simplified auth. A real app would use JWT.
  io.use(async (socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      return next(new Error('Authentication error: No user ID'));
    }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      user.socketId = socket.id;
      await user.save({ validateBeforeSave: false });
      socket.user = user; // Attach user to socket
      next();
    } catch (err) {
      next(new Error('Authentication error: ' + err.message));
    }
  });


  // --- Socket.IO Connection Handling ---
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.name})`);
    
    // Join a room for the user
    socket.join(socket.user._id.toString());
    
    // --- Meeting Handlers ---
    socket.on('meeting:join', (meetingId) => {
      socket.join(meetingId);
      console.log(`User ${socket.user.name} joined meeting room ${meetingId}`);
    });
    
    socket.on('meeting:leave', (meetingId) => {
      socket.leave(meetingId);
      console.log(`User ${socket.user.name} left meeting room ${meetingId}`);
    });

    // --- Live Transcript & Speaker Tracking ---
    socket.on('meeting:transcript_update', (data) => {
      const { meetingId, transcriptEntry } = data; // { speakerName, text, timestamp }
      // Broadcast to everyone else in the meeting
      socket.to(meetingId).emit('meeting:transcript_received', transcriptEntry);
      
      // TODO: Save transcript entry to DB (or buffer and save periodically)
    });
    
    socket.on('meeting:speaker_change', (data) => {
      const { meetingId, zoomUserId, userName } = data;
      console.log(`Active Speaker: ${userName} in meeting ${meetingId}`);
      
      // Broadcast to all in room
      io.to(meetingId).emit('meeting:active_speaker', { zoomUserId, userName });
      
      // --- Analytics: Track Speak Time ---
      const now = Date.now();
      const meetingTimers = speakerTimers.get(meetingId) || new Map();
      
      // Stop timer for previous speaker
      meetingTimers.forEach((startTime, userId) => {
        if (userId !== zoomUserId && startTime) {
          const duration = (now - startTime) / 1000; // in seconds
          updateSpeakerTime(meetingId, userId, duration);
          meetingTimers.set(userId, null); // Clear timer
        }
      });
      
      // Start timer for new speaker
      if (!meetingTimers.get(zoomUserId)) {
        meetingTimers.set(zoomUserId, now);
      }
      
      speakerTimers.set(meetingId, meetingTimers);
    });

    // --- Disconnect ---
    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      try {
        if (socket.user) {
          await User.findByIdAndUpdate(socket.user._id, { socketId: null });
        }
      } catch (err) {
        console.error('Error clearing socketId on disconnect:', err);
      }
    });
  });

  return io;
};

// Helper to update speak time in Redis (or DB)
async function updateSpeakerTime(meetingId, zoomUserId, duration) {
  // This is a simplified example.
  // In a real app, you'd map zoomUserId to your User._id
  // and update the Meeting.analytics.speakerStats
  
  // Using Redis HINCRBYFLOAT for precision
  try {
    await redisClient.hincrbyfloat(
      `meeting:${meetingId}:speakTime`,
      zoomUserId,
      duration
    );
    console.log(`[Analytics] Added ${duration.toFixed(2)}s for user ${zoomUserId} in meeting ${meetingId}`);
    
    // TODO: On meeting 'end' event, persist this Redis data to MongoDB
    
  } catch (err) {
    console.error('Redis speak time error:', err);
  }
}

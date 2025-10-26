import 'dotenv/config';
import http from 'http';
import { app } from './app.js';
import connectDB from './config/db.config.js';
import { initSocketIO } from './socket/socket.handler.js';
import redisClient from './config/redis.config.js';

const PORT = process.env.PORT || 8000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocketIO(server);

// Make io instance available to app (e.g., in req)
app.set('io', io);

// Connect to Database and Start Server
(async () => {
  try {
    await connectDB();
    // await redisClient.connect().then(() => console.log('Redis connected successfully.'));
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`Visit http://localhost:${PORT}`);
      // Note: Run the worker in a separate process: npm run worker
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimiter } from './api/middlewares/rateLimiter.middleware.js';
import { globalErrorHandler } from './api/middlewares/error.middleware.js';
import v1Router from './api/routes/v1.routes.js';

const app = express();

// --- Global Middlewares ---

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

// Helmet for security headers
app.use(helmet());

// Rate Limiting
app.use(rateLimiter);

// Body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Cookie parser
app.use(cookieParser());

// --- API Routes ---
app.use('/api/v1',(req,res,next)=>{
    console.log(`in v1`)
    next();
} ,v1Router);

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MeetMind API is running.',
  });
});

// --- Error Handling ---
// 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export { app };

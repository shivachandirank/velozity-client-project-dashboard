import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export const app = express();

// Security Headers
app.use(helmet());

// CORS configuration supporting dynamic Vercel subdomains
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const configuredClient = env.CLIENT_URL.replace(/\/$/, '');
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        cleanOrigin === configuredClient ||
        cleanOrigin === 'http://localhost:5173' ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body and Cookie Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { seedDatabase } from './services/autoSeedService';

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Automatic Remote Seed Endpoint
app.get('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully with demo accounts, projects, tasks, and activity logs.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Seed failed' });
  }
});

// Main API Routes
app.use('/api', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { logger } from './config/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }));

  // CORS Configuration
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

  // Strict Request Body Size Limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Authentication Brute-Force Rate Limiting
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 attempts per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    },
    skip: () => env.NODE_ENV === 'test', // Skip rate limiting during automated test suites
  });

  // Apply Auth Rate Limiter
  app.use(`${env.API_PREFIX}/auth/login`, authLimiter);
  app.use(`${env.API_PREFIX}/auth/register`, authLimiter);

  // Request logger (safe - never logs auth headers or sensitive body contents)
  app.use((req: Request, _res: Response, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
  });

  // Base root health check
  app.get('/', (_req, res) => {
    res.json({
      name: 'CommunityPark API',
      version: '1.0.0',
      docs: `${env.API_PREFIX}/health`,
    });
  });

  // Versioned API Routes
  app.use(env.API_PREFIX, apiRoutes);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: 'Endpoint not found',
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();

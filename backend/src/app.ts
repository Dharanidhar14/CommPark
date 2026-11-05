import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { logger } from './config/logger';
import apiRoutes from './routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logger
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

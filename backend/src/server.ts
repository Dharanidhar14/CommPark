import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { connectPrisma, prisma } from './prisma';

async function bootstrap() {
  if (!env.USE_MEMORY_DB) {
    await connectPrisma();
  } else {
    logger.info('Running in In-Memory Database Mode with realistic demo data.');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CommunityPark Backend Server running on port ${env.PORT}`);
    logger.info(`📡 API endpoint: http://localhost:${env.PORT}${env.API_PREFIX}`);
    logger.info(`🩺 Health check: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  const shutdown = async () => {
    logger.info('Gracefully shutting down server...');
    server.close(async () => {
      if (!env.USE_MEMORY_DB) {
        await prisma.$disconnect();
      }
      logger.info('Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

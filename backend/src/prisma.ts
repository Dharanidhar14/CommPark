import { PrismaClient } from '@prisma/client';
import { logger } from './config/logger';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export async function connectPrisma(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
    return true;
  } catch (error) {
    logger.warn('Could not connect to PostgreSQL via Prisma, falling back to in-memory repositories if configured');
    return false;
  }
}

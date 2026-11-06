import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const message = err.message || 'Internal server error';
  logger.error(`Error caught by handler: ${message}`, { stack: err.stack });

  let statusCode = 500;
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('not found')) {
    statusCode = 404;
  } else if (
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('authentication') ||
    lowerMsg.includes('invalid email or password') ||
    lowerMsg.includes('expired authentication token')
  ) {
    statusCode = 401;
  } else if (
    lowerMsg.includes('forbidden') ||
    lowerMsg.includes('requires one of') ||
    lowerMsg.includes('not an authorized') ||
    lowerMsg.includes('self-approval') ||
    lowerMsg.includes('revoked or suspended')
  ) {
    statusCode = 403;
  } else if (
    lowerMsg.includes('already exists') ||
    lowerMsg.includes('already reserved') ||
    lowerMsg.includes('already booked') ||
    lowerMsg.includes('already been submitted') ||
    lowerMsg.includes('already registered') ||
    lowerMsg.includes('duplicate') ||
    lowerMsg.includes('already completed') ||
    lowerMsg.includes('already cancelled') ||
    lowerMsg.includes('already been cancelled') ||
    lowerMsg.includes('already canceled') ||
    lowerMsg.includes('already been canceled') ||
    lowerMsg.includes('cannot change status')
  ) {
    statusCode = 409;
  } else if (
    lowerMsg.includes('invalid') ||
    lowerMsg.includes('insufficient') ||
    lowerMsg.includes('end time must be after') ||
    lowerMsg.includes('validation') ||
    lowerMsg.includes('cannot delete') ||
    lowerMsg.includes('cannot remove') ||
    lowerMsg.includes('pending community') ||
    lowerMsg.includes('cannot be booked yet') ||
    lowerMsg.includes('outside allowed arrival window')
  ) {
    statusCode = 400;
  }

  const clientMessage =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : message;

  res.status(statusCode).json({
    success: false,
    error: clientMessage,
  });
}

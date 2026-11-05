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

  if (message.includes('not found') || message.includes('Not found')) {
    statusCode = 404;
  } else if (
    message.includes('Unauthorized') ||
    message.includes('authentication') ||
    message.includes('Invalid email or password') ||
    message.includes('expired authentication token')
  ) {
    statusCode = 401;
  } else if (message.includes('Forbidden') || message.includes('requires one of')) {
    statusCode = 403;
  } else if (
    message.includes('already exists') ||
    message.includes('already reserved') ||
    message.includes('already booked') ||
    message.includes('already been submitted') ||
    message.includes('already registered')
  ) {
    statusCode = 409;
  } else if (
    message.includes('Invalid') ||
    message.includes('Insufficient') ||
    message.includes('End time must be after') ||
    message.includes('Validation') ||
    message.includes('Cannot delete') ||
    message.includes('Cannot remove') ||
    message.includes('pending community') ||
    message.includes('cannot be booked yet')
  ) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

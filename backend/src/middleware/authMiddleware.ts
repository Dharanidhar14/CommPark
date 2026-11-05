import { Request, Response, NextFunction } from 'express';
import { services } from '../services';
import { AuthUserPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Missing or malformed Bearer token.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await services.authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid or expired authentication token.',
    });
  }
}

export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = await services.authService.verifyToken(token);
      req.user = payload;
    } catch {
      // Ignore token failure in optional auth
    }
  }
  next();
}

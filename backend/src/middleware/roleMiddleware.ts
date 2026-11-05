import { Request, Response, NextFunction } from 'express';
import { Role } from '../repositories/IUserRepository';

export function requireRoles(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required before checking roles.',
      });
      return;
    }

    const hasActiveRole = allowedRoles.includes(req.user.activeRole);
    const hasEligibleRole = req.user.eligibleRoles?.some((r) => allowedRoles.includes(r));

    if (!hasActiveRole && !hasEligibleRole) {
      res.status(403).json({
        success: false,
        error: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
      return;
    }

    next();
  };
}

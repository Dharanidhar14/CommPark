import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { Role } from '../repositories/IUserRepository';

const router = Router();

// Strictly sanitized public registration schema - no roles allowed
const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  city: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

const switchRoleSchema = z.object({
  role: z.enum(['CUSTOMER', 'OWNER', 'SECURITY', 'COMMUNITY_ADMIN']),
});

router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.authService.register({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        phone: req.body.phone,
        city: req.body.city,
      });
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone,
            activeRole: result.user.activeRole,
            eligibleRoles: result.user.eligibleRoles,
            city: result.user.city,
            verificationStatus: result.user.verificationStatus,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.authService.login(req.body);
      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone,
            activeRole: result.user.activeRole,
            eligibleRoles: result.user.eligibleRoles,
            city: result.user.city,
            verificationStatus: result.user.verificationStatus,
          },
          token: result.token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/switch-role',
  authMiddleware,
  validateBody(switchRoleSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await services.authService.switchRole(
        req.user!.id,
        req.body.role as Role
      );
      res.json({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            phone: result.user.phone,
            activeRole: result.user.activeRole,
            eligibleRoles: result.user.eligibleRoles,
            city: result.user.city,
            verificationStatus: result.user.verificationStatus,
          },
          token: result.token,
        },
        message: `Switched active role to ${req.body.role} successfully.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wallet = await services.walletService.getWallet(req.user!.id);
      res.json({
        success: true,
        data: {
          user: req.user,
          wallet: {
            availableBalance: wallet.availableBalance,
            earnedAsOwner: wallet.earnedAsOwner,
            earnedAsGuard: wallet.earnedAsGuard,
            currency: wallet.currency,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/logout', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export default router;

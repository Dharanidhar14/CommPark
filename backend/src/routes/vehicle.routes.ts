import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware } from '../middleware/authMiddleware';
import { VehicleCategory } from '../repositories/IVehicleRepository';

const router = Router();

const vehicleSchema = z.object({
  licensePlate: z.string().min(4, 'Valid vehicle license plate is required'),
  make: z.string().min(2, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  color: z.string().min(2, 'Color is required'),
  type: z.enum(['SEDAN', 'SUV', 'EV', 'HATCHBACK', 'MOTORCYCLE', 'VAN']).optional(),
  isDefault: z.boolean().optional(),
});

router.use(authMiddleware);

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const list = await services.vehicleService.getUserVehicles(req.user!.id);
    res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/',
  validateBody(vehicleSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const vehicle = await services.vehicleService.addVehicle(req.user!.id, {
        ...req.body,
        type: req.body.type as VehicleCategory,
      });
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await services.vehicleService.updateVehicle(
        req.user!.id,
        req.params.id as string,
        req.body
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await services.vehicleService.deleteVehicle(req.user!.id, req.params.id as string);
      res.json({ success: true, message: 'Vehicle deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:id/default',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await services.vehicleService.setDefaultVehicle(req.user!.id, req.params.id as string);
      res.json({ success: true, message: 'Default vehicle updated successfully.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

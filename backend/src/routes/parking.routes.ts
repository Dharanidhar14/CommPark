import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { services } from '../services';
import { validateBody } from '../middleware/validateRequest';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/authMiddleware';
import { requireRoles } from '../middleware/roleMiddleware';
import {
  ParkingCategory,
  AccessMethod,
} from '../repositories/IParkingRepository';
import { VehicleCategory } from '../repositories/IVehicleRepository';

const router = Router();

const createListingSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  address: z.string().min(5, 'Full street address is required'),
  locality: z.string().min(2, 'Locality is required'),
  neighborhood: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(6, 'Valid 6-digit postal code is required'),
  latitude: z.number(),
  longitude: z.number(),
  category: z.enum(['RESIDENTIAL', 'DRIVEWAY', 'STREET_BAY', 'COMMERCIAL']),
  accessType: z.enum(['SECURITY_VERIFIED', 'OWNER_ASSISTED', 'DIRECT_ACCESS', 'FACILITY_MANAGED']),
  pricePerHour: z.number().positive('Price per hour must be positive'),
  pricePerDay: z.number().positive('Price per day must be positive'),
  isCovered: z.boolean().optional(),
  supportedVehicles: z.array(z.enum(['SEDAN', 'SUV', 'EV', 'HATCHBACK', 'MOTORCYCLE', 'VAN'])).optional(),
  amenities: z.array(z.string()).optional(),
  totalSpots: z.number().int().positive().optional(),
  communityId: z.string().optional().nullable(),
  unitNumber: z.string().optional().nullable(),
  slotNumber: z.string().optional().nullable(),
  accessInstructions: z.string().optional().nullable(),
  securityGuardOnSite: z.boolean().optional(),
  operatingHours: z.string().optional(),
  images: z.array(z.string()).optional(),
});

const discoveryQuerySchema = z.object({
  query: z.string().optional(),
  locality: z.string().optional(),
  city: z.string().optional(),
  category: z.enum(['RESIDENTIAL', 'DRIVEWAY', 'STREET_BAY', 'COMMERCIAL']).optional(),
  accessType: z.enum(['SECURITY_VERIFIED', 'OWNER_ASSISTED', 'DIRECT_ACCESS', 'FACILITY_MANAGED']).optional(),
  supportedVehicle: z.enum(['SEDAN', 'SUV', 'EV', 'HATCHBACK', 'MOTORCYCLE', 'VAN']).optional(),
  isCovered: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  minPrice: z.coerce.number().min(0, 'minPrice must be non-negative').optional(),
  maxPrice: z.coerce.number().positive('maxPrice must be positive').optional(),
  latitude: z.coerce.number().min(-90, 'Latitude must be between -90 and 90').max(90, 'Latitude must be between -90 and 90').optional(),
  longitude: z.coerce.number().min(-180, 'Longitude must be between -180 and 180').max(180, 'Longitude must be between -180 and 180').optional(),
  radiusKm: z.coerce.number().positive('radiusKm must be positive').max(100, 'Maximum search radius is 100km').optional(),
  minLat: z.coerce.number().min(-90).max(90).optional(),
  maxLat: z.coerce.number().min(-90).max(90).optional(),
  minLng: z.coerce.number().min(-180).max(180).optional(),
  maxLng: z.coerce.number().min(-180).max(180).optional(),
});

// Customer & Public Discovery
router.get(
  '/',
  optionalAuthMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = discoveryQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        const errorDetails = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        res.status(400).json({
          success: false,
          error: `Validation Error: ${errorDetails}`,
        });
        return;
      }

      const q = parsed.data;

      const isAdmin =
        req.user?.activeRole === 'COMMUNITY_ADMIN' ||
        req.user?.eligibleRoles?.includes('COMMUNITY_ADMIN');

      const listings = await services.parkingService.getListings(
        {
          query: q.query,
          locality: q.locality,
          city: q.city,
          category: q.category as ParkingCategory,
          accessType: q.accessType as AccessMethod,
          supportedVehicle: q.supportedVehicle as VehicleCategory,
          isCovered: q.isCovered,
          minPrice: q.minPrice,
          maxPrice: q.maxPrice,
          latitude: q.latitude,
          longitude: q.longitude,
          radiusKm: q.radiusKm,
          minLat: q.minLat,
          maxLat: q.maxLat,
          minLng: q.minLng,
          maxLng: q.maxLng,
          onlyAvailable: true,
        },
        Boolean(isAdmin)
      );

      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }
);

// Owner: Get My Listings
router.get(
  '/owner/my-listings',
  authMiddleware,
  requireRoles('OWNER', 'COMMUNITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listings = await services.parkingService.getOwnerListings(req.user!.id);
      res.json({ success: true, data: listings });
    } catch (error) {
      next(error);
    }
  }
);

// Single Listing Details
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listing = await services.parkingService.getListingById(req.params.id as string);
      if (!listing) {
        res.status(404).json({ success: false, error: 'Parking listing not found' });
        return;
      }
      res.json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }
);

// Owner: Create Parking Listing
router.post(
  '/',
  authMiddleware,
  requireRoles('OWNER', 'COMMUNITY_ADMIN'),
  validateBody(createListingSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const listing = await services.parkingService.createListing(
        req.user!.id,
        req.body
      );
      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      next(error);
    }
  }
);

// Owner: Update Listing
router.put(
  '/:id',
  authMiddleware,
  requireRoles('OWNER', 'COMMUNITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await services.parkingService.updateListing(
        req.params.id as string,
        req.user!.id,
        req.body
      );
      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// Owner: Delete Listing
router.delete(
  '/:id',
  authMiddleware,
  requireRoles('OWNER', 'COMMUNITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await services.parkingService.deleteListing(req.params.id as string, req.user!.id);
      res.json({ success: true, message: 'Parking listing deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

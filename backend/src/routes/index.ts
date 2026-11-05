import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vehicleRoutes from './vehicle.routes';
import parkingRoutes from './parking.routes';
import bookingRoutes from './booking.routes';
import walletRoutes from './wallet.routes';
import communityRoutes from './community.routes';
import securityRoutes from './security.routes';
import reviewRoutes from './review.routes';
import supportRoutes from './support.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CommunityPark Backend API',
    version: '1.0.0',
    mode: process.env.USE_MEMORY_DB === 'true' ? 'in-memory' : 'database',
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/parking', parkingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/wallet', walletRoutes);
router.use('/communities', communityRoutes);
router.use('/security', securityRoutes);
router.use('/reviews', reviewRoutes);
router.use('/support', supportRoutes);

export default router;

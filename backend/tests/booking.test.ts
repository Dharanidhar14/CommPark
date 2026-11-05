import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Booking & Concurrency Tests', () => {
  let customerToken: string;
  let customerId: string;
  let vehicleId: string;

  beforeAll(async () => {
    // Log in as Aditya Sharma (seeded user with funds in wallet)
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aditya.sharma@example.in',
        password: 'password123',
      });

    customerToken = loginRes.body.data.token;
    customerId = loginRes.body.data.user.id;

    // Fetch Aditya's vehicles
    const vehRes = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${customerToken}`);

    vehicleId = vehRes.body.data[0].id;
  });

  it('should calculate server-authoritative pricing and create reservation', async () => {
    const startTime = new Date(Date.now() + 48 * 3600 * 1000);
    startTime.setMinutes(0, 0, 0);
    const endTime = new Date(startTime.getTime() + 3 * 3600 * 1000); // 3 hours

    // space_02 is ₹30/hour
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: 'space_02',
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        paymentMethod: 'CommunityPark Wallet',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    const booking = res.body.data;
    expect(booking.durationHours).toBe(3);
    expect(booking.subtotal).toBe(90); // 3 * 30
    expect(booking.serviceFee).toBe(15);
    expect(booking.totalAmount).toBe(105);
    expect(booking.status).toBe('UPCOMING');
    expect(booking.qrCodeToken).toBeDefined();
  });

  it('should reject double-booking for overlapping time window', async () => {
    const startTime = new Date(Date.now() + 72 * 3600 * 1000);
    startTime.setMinutes(0, 0, 0);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000); // 2 hours

    // First booking succeeds
    const firstRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: 'space_01',
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(firstRes.status).toBe(201);

    // Second booking with overlapping window (starts 1 hour in)
    const overlapStart = new Date(startTime.getTime() + 1 * 3600 * 1000);
    const overlapEnd = new Date(overlapStart.getTime() + 2 * 3600 * 1000);

    const overlapRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: 'space_01',
        vehicleId,
        startTime: overlapStart.toISOString(),
        endTime: overlapEnd.toISOString(),
      });

    expect(overlapRes.status).toBe(409);
    expect(overlapRes.body.success).toBe(false);
    expect(overlapRes.body.error).toContain('already reserved');
  });

  it('should reject booking for residential space that is pending community approval', async () => {
    const startTime = new Date(Date.now() + 96 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: 'space_05_pending',
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('pending community RWA approval');
  });

  it('should cancel booking and refund customer wallet', async () => {
    const startTime = new Date(Date.now() + 120 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    // Create booking
    const createRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        listingId: 'space_04',
        vehicleId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    const bookingId = createRes.body.data.id;

    // Check wallet balance before cancel
    const walletBefore = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${customerToken}`);

    const balanceBefore = walletBefore.body.data.availableBalance;

    // Cancel booking
    const cancelRes = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ reason: 'Plans changed' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.refundAmount).toBe(createRes.body.data.totalAmount);

    // Verify wallet received refund
    const walletAfter = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(walletAfter.body.data.availableBalance).toBe(
      balanceBefore + cancelRes.body.refundAmount
    );
  });
});

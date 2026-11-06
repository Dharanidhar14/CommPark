import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Booking Concurrency, Lifecycle & Atomic Integrity Tests (Task 07)', () => {
  let customer1Token: string;
  let customer1VehId: string;
  let customer2Token: string;
  let customer2VehId: string;

  beforeAll(async () => {
    // 1. Aditya Sharma (Customer 1, funded wallet)
    const login1 = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'aditya.sharma@example.in',
        password: 'password123',
      });
    customer1Token = login1.body.data.token;

    const v1 = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${customer1Token}`);
    customer1VehId = v1.body.data[0].id;

    // 2. Register fresh Customer 2 with funded wallet
    const email2 = `concurrency.user.${Date.now()}@example.in`;
    const reg2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: email2,
        password: 'password123',
        name: 'Concurrent User 2',
        phone: '+91 9888877777',
      });
    customer2Token = reg2.body.data.token;

    // Top up Customer 2 wallet with ₹1000
    await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ amount: 1000, paymentMethod: 'UPI' });

    // Register vehicle for Customer 2
    const v2 = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        licensePlate: 'KA 03 MM 1234',
        make: 'Hyundai',
        model: 'i20',
        type: 'HATCHBACK',
        color: 'White',
      });
    customer2VehId = v2.body.data.id;
  });

  it('should serialize concurrent overlapping reservation requests: exactly 1 succeeds, 1 rejected with 409', async () => {
    const startTime = new Date(Date.now() + 144 * 3600 * 1000);
    startTime.setMinutes(0, 0, 0);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    // Send simultaneous overlapping requests for space_02 (Indiranagar Street Bay)
    const [req1, req2] = await Promise.all([
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          listingId: 'space_02',
          vehicleId: customer1VehId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          listingId: 'space_02',
          vehicleId: customer2VehId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
    ]);

    const statuses = [req1.status, req2.status];
    expect(statuses).toContain(201);
    expect(statuses).toContain(409);

    const successfulRes = req1.status === 201 ? req1 : req2;
    const rejectedRes = req1.status === 409 ? req1 : req2;

    expect(successfulRes.body.success).toBe(true);
    expect(rejectedRes.body.success).toBe(false);
    expect(rejectedRes.body.error).toContain('already reserved');
  });

  it('should allow concurrent requests for distinct non-overlapping time windows on the same space', async () => {
    const window1Start = new Date(Date.now() + 168 * 3600 * 1000);
    window1Start.setMinutes(0, 0, 0);
    const window1End = new Date(window1Start.getTime() + 2 * 3600 * 1000);

    const window2Start = new Date(window1End.getTime() + 1 * 3600 * 1000); // 1 hour after window 1
    const window2End = new Date(window2Start.getTime() + 2 * 3600 * 1000);

    const [req1, req2] = await Promise.all([
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customer1Token}`)
        .send({
          listingId: 'space_02',
          vehicleId: customer1VehId,
          startTime: window1Start.toISOString(),
          endTime: window1End.toISOString(),
        }),
      request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          listingId: 'space_02',
          vehicleId: customer2VehId,
          startTime: window2Start.toISOString(),
          endTime: window2End.toISOString(),
        }),
    ]);

    expect(req1.status).toBe(201);
    expect(req2.status).toBe(201);
    expect(req1.body.success).toBe(true);
    expect(req2.body.success).toBe(true);
  });

  it('should reject duplicate cancellations and prevent double refunds', async () => {
    const startTime = new Date(Date.now() + 192 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    // Create booking
    const createRes = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({
        listingId: 'space_04',
        vehicleId: customer2VehId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    expect(createRes.status).toBe(201);
    const bookingId = createRes.body.data.id;
    const totalAmount = createRes.body.data.totalAmount;

    // Get balance before cancel
    const balBefore = (
      await request(app).get('/api/v1/wallet').set('Authorization', `Bearer ${customer2Token}`)
    ).body.data.availableBalance;

    // First cancel succeeds
    const cancel1 = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ reason: 'First cancel' });

    expect(cancel1.status).toBe(200);
    expect(cancel1.body.success).toBe(true);

    const balAfterFirst = (
      await request(app).get('/api/v1/wallet').set('Authorization', `Bearer ${customer2Token}`)
    ).body.data.availableBalance;
    expect(balAfterFirst).toBe(balBefore + totalAmount);

    // Second cancel attempt must fail and must not credit refund again
    const cancel2 = await request(app)
      .post(`/api/v1/bookings/${bookingId}/cancel`)
      .set('Authorization', `Bearer ${customer2Token}`)
      .send({ reason: 'Repeated cancel attempt' });

    expect(cancel2.status).toBe(409);
    expect(cancel2.body.success).toBe(false);
    expect(cancel2.body.error).toContain('already been cancelled');

    const balAfterSecond = (
      await request(app).get('/api/v1/wallet').set('Authorization', `Bearer ${customer2Token}`)
    ).body.data.availableBalance;
    expect(balAfterSecond).toBe(balAfterFirst); // Balance unchanged!
  });

  it('should fail booking creation atomically if customer has insufficient funds', async () => {
    // Register broke user with ₹0 balance
    const brokeEmail = `broke.user.${Date.now()}@example.in`;
    const brokeReg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: brokeEmail,
        password: 'password123',
        name: 'Broke User',
        phone: '+91 9777766666',
      });
    const brokeToken = brokeReg.body.data.token;

    const bVeh = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${brokeToken}`)
      .send({
        licensePlate: 'KA 05 JJ 9988',
        make: 'Maruti',
        model: 'Alto',
        type: 'HATCHBACK',
        color: 'Silver',
      });

    const startTime = new Date(Date.now() + 216 * 3600 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 3600 * 1000);

    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${brokeToken}`)
      .send({
        listingId: 'space_01',
        vehicleId: bVeh.body.data.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Insufficient wallet balance');
  });
});

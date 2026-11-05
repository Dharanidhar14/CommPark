import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Security Guard Verification & Gate Access Tests', () => {
  let guardToken: string;
  let guardId: string;

  beforeAll(async () => {
    // Log in as Ramesh Gowda (seeded Security Guard)
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'ramesh.g@example.in',
        password: 'password123',
      });

    guardToken = loginRes.body.data.token;
    guardId = loginRes.body.data.user.id;
  });

  it('should approve valid QR pass when vehicle plate matches and credit guard incentive', async () => {
    // Fetch guard's wallet before verification
    const walletBefore = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${guardToken}`);

    const guardEarnedBefore = walletBefore.body.data.earnedAsGuard;

    // Verify valid booking pass bk_upcoming_01 (Plate: KA 01 MJ 4821)
    const verifyRes = await request(app)
      .post('/api/v1/security/verify')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        qrCodeToken: 'CP-PASS-BLR-891-ADITYA',
        licensePlate: 'KA 01 MJ 4821',
        gateNumber: 'Gate 2',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.status).toBe('APPROVED');
    expect(verifyRes.body.data.verification.guardIncentiveAmount).toBe(15);

    // Verify guard wallet received ₹15 incentive
    const walletAfter = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${guardToken}`);

    expect(walletAfter.body.data.earnedAsGuard).toBe(guardEarnedBefore + 15);
  });

  it('should deny verification when vehicle license plate does not match', async () => {
    const verifyRes = await request(app)
      .post('/api/v1/security/verify')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        qrCodeToken: 'CP-PASS-BLR-891-ADITYA',
        licensePlate: 'DL 01 AA 9999', // Mismatched plate
        gateNumber: 'Gate 2',
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(false);
    expect(verifyRes.body.data.status).toBe('DENIED');
    expect(verifyRes.body.data.message).toContain('Plate Mismatch');
  });

  it('should record exit and complete booking session', async () => {
    const exitRes = await request(app)
      .post('/api/v1/security/exit')
      .set('Authorization', `Bearer ${guardToken}`)
      .send({
        bookingId: 'bk_upcoming_01',
        gateNumber: 'Gate 2',
      });

    expect(exitRes.status).toBe(200);
    expect(exitRes.body.success).toBe(true);
    expect(exitRes.body.data.result).toBe('EXIT_RECORDED');
  });
});

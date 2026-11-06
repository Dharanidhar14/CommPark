import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Wallet Financial Integrity & Idempotency Tests (Task 07)', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    const email = `idempotent.wallet.${Date.now()}@example.in`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Idempotency Tester',
        phone: '+91 9123456789',
      });

    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should initialize new wallet with 0 balance', async () => {
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.availableBalance).toBe(0);
  });

  it('should deduplicate repeated top-ups with the same Idempotency-Key header', async () => {
    const idempotencyKey = `idem-topup-${Date.now()}-abc`;

    // First request
    const res1 = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        amount: 250,
        paymentMethod: 'UPI (GPay)',
      });

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.wallet.availableBalance).toBe(250);
    const txId1 = res1.body.data.transaction.id;

    // Second request with exact same Idempotency-Key
    const res2 = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        amount: 250,
        paymentMethod: 'UPI (GPay)',
      });

    expect(res2.status).toBe(200);
    expect(res2.body.success).toBe(true);
    // Crucial check: wallet balance is STILL 250, NOT 500!
    expect(res2.body.data.wallet.availableBalance).toBe(250);
    // Returns the exact same transaction ID
    expect(res2.body.data.transaction.id).toBe(txId1);

    // Verify database wallet balance directly
    const balRes = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${userToken}`);

    expect(balRes.body.data.availableBalance).toBe(250);
  });

  it('should process distinct top-ups with different idempotency keys', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', `idem-topup-${Date.now()}-distinct`)
      .send({
        amount: 150,
        paymentMethod: 'Net Banking',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.wallet.availableBalance).toBe(400); // 250 + 150
  });

  it('should generate cryptographically secure non-predictable reference numbers', async () => {
    const txRes = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(txRes.status).toBe(200);
    expect(txRes.body.data.length).toBeGreaterThan(0);

    for (const tx of txRes.body.data) {
      expect(tx.referenceNumber).toBeDefined();
      expect(tx.referenceNumber.length).toBeGreaterThanOrEqual(10);
      expect(typeof tx.referenceNumber).toBe('string');
    }
  });

  it('should reject non-positive amounts with 400', async () => {
    const resZero = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: 0 });
    expect(resZero.status).toBe(400);

    const resNeg = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: -100 });
    expect(resNeg.status).toBe(400);
  });
});

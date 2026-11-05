import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Wallet & Ledger Financial Consistency Tests', () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register fresh user with 0 balance
    const email = `wallet.test.${Date.now()}@example.in`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Wallet Tester',
        phone: '+91 9123456789',
      });

    userToken = regRes.body.data.token;
    userId = regRes.body.data.user.id;
  });

  it('should initialize new user wallet with zero balance', async () => {
    const res = await request(app)
      .get('/api/v1/wallet')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.availableBalance).toBe(0);
    expect(res.body.data.currency).toBe('₹');
  });

  it('should credit wallet on top-up and record transaction in ledger', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        amount: 500,
        paymentMethod: 'UPI (GPay)',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.wallet.availableBalance).toBe(500);
    expect(res.body.data.transaction.type).toBe('WALLET_TOPUP');
    expect(res.body.data.transaction.amount).toBe(500);

    // Verify transactions endpoint
    const txRes = await request(app)
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${userToken}`);

    expect(txRes.status).toBe(200);
    expect(txRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(txRes.body.data[0].amount).toBe(500);
  });

  it('should reject top-up with zero or negative amount', async () => {
    const res = await request(app)
      .post('/api/v1/wallet/topup')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ amount: -50 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

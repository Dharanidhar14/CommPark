import request from 'supertest';
import { app } from '../src/app';

describe('Parking Geographic Discovery API (Task 08)', () => {
  it('should return 200 and spaces within geographic radius of Indiranagar', async () => {
    // Indiranagar coordinates: 12.9716, 77.6412
    const res = await request(app)
      .get('/api/v1/parking')
      .query({
        latitude: 12.9716,
        longitude: 77.6412,
        radiusKm: 2.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const ids = res.body.data.map((s: any) => s.id);
    expect(ids).toContain('space_01');
    expect(ids).toContain('space_02');
    expect(ids).toContain('space_03');

    // Koramangala space (space_04) is ~5-6 km away, should be excluded within 2km radius
    expect(ids).not.toContain('space_04');
  });

  it('should exclude distant parking spaces outside the specified radius', async () => {
    // Mumbai BKC coordinates: 19.0657, 72.8687
    // Querying with 10km radius in Mumbai should exclude Bengaluru spaces
    const res = await request(app)
      .get('/api/v1/parking')
      .query({
        latitude: 19.0657,
        longitude: 72.8687,
        radiusKm: 10.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const ids = res.body.data.map((s: any) => s.id);
    expect(ids).not.toContain('space_01');
    expect(ids).not.toContain('space_04');
  });

  it('should support bounding box search (minLat, maxLat, minLng, maxLng)', async () => {
    // Bounding box around central Indiranagar
    const res = await request(app)
      .get('/api/v1/parking')
      .query({
        minLat: 12.965,
        maxLat: 12.985,
        minLng: 77.635,
        maxLng: 77.655,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);

    for (const space of res.body.data) {
      expect(space.latitude).toBeGreaterThanOrEqual(12.965);
      expect(space.latitude).toBeLessThanOrEqual(12.985);
      expect(space.longitude).toBeGreaterThanOrEqual(77.635);
      expect(space.longitude).toBeLessThanOrEqual(77.655);
    }
  });

  it('should reject invalid coordinates with HTTP 400 Bad Request', async () => {
    // Invalid latitude (> 90)
    const res1 = await request(app)
      .get('/api/v1/parking')
      .query({ latitude: 120, longitude: 77.6412 });
    expect(res1.status).toBe(400);

    // Invalid longitude (> 180)
    const res2 = await request(app)
      .get('/api/v1/parking')
      .query({ latitude: 12.9716, longitude: 200 });
    expect(res2.status).toBe(400);

    // Negative radius
    const res3 = await request(app)
      .get('/api/v1/parking')
      .query({ latitude: 12.9716, longitude: 77.6412, radiusKm: -5 });
    expect(res3.status).toBe(400);

    // Excessive radius (> 100km)
    const res4 = await request(app)
      .get('/api/v1/parking')
      .query({ latitude: 12.9716, longitude: 77.6412, radiusKm: 250 });
    expect(res4.status).toBe(400);
  });

  it('should never expose unapproved residential space in public discovery', async () => {
    // space_05_pending is in Bengaluru
    const res = await request(app)
      .get('/api/v1/parking')
      .query({
        city: 'Bengaluru',
      });

    expect(res.status).toBe(200);
    const ids = res.body.data.map((s: any) => s.id);
    expect(ids).not.toContain('space_05_pending');
  });

  it('should filter by minPrice and maxPrice accurately', async () => {
    const res = await request(app)
      .get('/api/v1/parking')
      .query({
        minPrice: 35,
        maxPrice: 45,
      });

    expect(res.status).toBe(200);
    for (const space of res.body.data) {
      expect(space.pricePerHour).toBeGreaterThanOrEqual(35);
      expect(space.pricePerHour).toBeLessThanOrEqual(45);
    }
  });
});

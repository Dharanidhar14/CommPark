import { loadAndValidateEnv } from '../src/config/env';

describe('Production Configuration Hardening Tests (Task 07)', () => {
  const baseValidProdEnv = {
    NODE_ENV: 'production',
    PORT: '5000',
    JWT_SECRET: 'production_high_entropy_secret_key_exceeding_32_characters_here',
    DATABASE_URL: 'postgresql://prod_user:SuperSecretPass99@db.commpark.internal:5432/commpark_prod',
    CORS_ORIGIN: 'https://commpark.in,https://admin.commpark.in',
  };

  it('should validate and parse successfully with production-hardened parameters', () => {
    const config = loadAndValidateEnv(baseValidProdEnv);
    expect(config.NODE_ENV).toBe('production');
    expect(config.PORT).toBe(5000);
    expect(config.JWT_SECRET).toBe(baseValidProdEnv.JWT_SECRET);
    expect(config.DATABASE_URL).toBe(baseValidProdEnv.DATABASE_URL);
    expect(config.CORS_ORIGIN).toBe(baseValidProdEnv.CORS_ORIGIN);
  });

  it('should fail fast in production if JWT_SECRET is default or missing', () => {
    expect(() =>
      loadAndValidateEnv({
        ...baseValidProdEnv,
        JWT_SECRET: undefined,
      })
    ).toThrow('[Config Fatal] Production requires a secure, non-default JWT_SECRET of at least 32 characters.');
  });

  it('should fail fast in production if JWT_SECRET is less than 32 characters', () => {
    expect(() =>
      loadAndValidateEnv({
        ...baseValidProdEnv,
        JWT_SECRET: 'short_secret_key_12345',
      })
    ).toThrow('[Config Fatal] Production requires a secure, non-default JWT_SECRET of at least 32 characters.');
  });

  it('should fail fast in production if DATABASE_URL is default development placeholder', () => {
    expect(() =>
      loadAndValidateEnv({
        ...baseValidProdEnv,
        DATABASE_URL: 'postgresql://commpark_admin:commpark_secure_pass@localhost:5432/commpark_db?schema=public',
      })
    ).toThrow('[Config Fatal] Production requires an explicit, configured production DATABASE_URL.');
  });

  it('should fail fast in production if CORS_ORIGIN is wildcard "*"', () => {
    expect(() =>
      loadAndValidateEnv({
        ...baseValidProdEnv,
        CORS_ORIGIN: '*',
      })
    ).toThrow('[Config Fatal] Insecure wildcard CORS_ORIGIN ("*") is prohibited in production.');
  });
});

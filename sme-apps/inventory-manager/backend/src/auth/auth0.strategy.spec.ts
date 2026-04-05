// src/auth/auth0.strategy.spec.ts

// Mock jwks-rsa and passport-jwt before any imports to avoid ESM issues
jest.mock('jwks-rsa', () => ({
  passportJwtSecret: jest.fn(() => jest.fn()),
}));
jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: jest.fn(() => jest.fn()) },
  Strategy: class MockStrategy {
    constructor() {}
  },
}));
jest.mock('@nestjs/passport', () => ({
  PassportStrategy: (Base: any) => {
    return class extends Base {
      constructor(...args: any[]) {
        super(...args);
      }
    };
  },
}));

import { Auth0Strategy } from './auth0.strategy';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: { findUnique: jest.fn() },
};

describe('Auth0Strategy', () => {
  let strategy: Auth0Strategy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Bypass the PassportStrategy constructor (which makes JWKS network calls)
    // by using Object.create to directly instantiate the prototype.
    strategy = Object.create(Auth0Strategy.prototype);
    (strategy as any).prisma = mockPrisma;
  });

  it('uses DB role when user exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ role: Role.ADMIN });
    const result = await strategy.validate({
      sub: 'auth0|123',
      'https://inventory/role': Role.STAFF,
      'https://inventory/email': 'a@b.com',
      'https://inventory/name': 'Alice',
    });
    expect(result.role).toBe(Role.ADMIN);
  });

  it('falls back to JWT claim role when user not in DB', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const result = await strategy.validate({
      sub: 'auth0|456',
      'https://inventory/role': Role.MANAGER,
      'https://inventory/email': 'b@b.com',
      'https://inventory/name': 'Bob',
    });
    expect(result.role).toBe(Role.MANAGER);
  });

  it('falls back to STAFF when user not in DB and no role claim', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const result = await strategy.validate({
      sub: 'auth0|789',
      'https://inventory/email': 'c@b.com',
      'https://inventory/name': 'Carol',
    });
    expect(result.role).toBe(Role.STAFF);
  });
});

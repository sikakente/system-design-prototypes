// src/auth/auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: { upsert: jest.fn() },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('upserts user with correct payload', async () => {
    const user = {
      id: 'u1',
      auth0Id: 'auth0|abc',
      email: 'a@b.com',
      name: 'Alice',
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.upsert.mockResolvedValue(user);

    const result = await service.upsertUser('auth0|abc', 'a@b.com', 'Alice', Role.STAFF);

    expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
      where: { auth0Id: 'auth0|abc' },
      update: { email: 'a@b.com', name: 'Alice' },
      create: { auth0Id: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: Role.STAFF },
    });
    expect(result).toEqual(user);
  });
});

// src/auth/auth.controller.spec.ts
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

const mockAuthService = { upsertUser: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('calls upsertUser with JWT payload and returns user', async () => {
    const user = {
      id: 'u1',
      auth0Id: 'auth0|abc',
      email: 'a@b.com',
      name: 'Alice',
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockAuthService.upsertUser.mockResolvedValue(user);

    const req = { user: { sub: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: 'STAFF' } };
    const result = await controller.me(req as any);

    expect(mockAuthService.upsertUser).toHaveBeenCalledWith('auth0|abc', 'a@b.com', 'Alice', 'STAFF');
    expect(result).toEqual(user);
  });
});

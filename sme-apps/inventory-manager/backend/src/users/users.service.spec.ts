import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const user = { id: 'u1', auth0Id: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: Role.STAFF, createdAt: new Date(), updatedAt: new Date() };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it('findAll returns users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([user]);
    expect(await service.findAll()).toEqual([user]);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});

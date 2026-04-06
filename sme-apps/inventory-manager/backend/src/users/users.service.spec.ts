import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Auth0ManagementService } from '../auth/auth0-management.service';
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

const mockAuth0Management = {
  syncRole: jest.fn().mockResolvedValue(undefined),
};

const user = { id: 'u1', auth0Id: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: Role.STAFF, createdAt: new Date(), updatedAt: new Date() };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: Auth0ManagementService, useValue: mockAuth0Management },
      ],
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

  it('create calls prisma.user.create with correct data', async () => {
    const dto = { auth0Id: 'auth0|123', email: 'a@b.com', name: 'Alice', role: Role.STAFF };
    mockPrisma.user.create.mockResolvedValue({ id: 'u1', ...dto });
    const result = await service.create(dto);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { auth0Id: 'auth0|123', email: 'a@b.com', name: 'Alice', role: Role.STAFF },
    });
    expect(result).toMatchObject(dto);
  });

  it('update calls prisma.user.update when user exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue({ ...user, name: 'Alice B' });
    await service.update('u1', { name: 'Alice B' });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'Alice B' },
    });
  });

  it('update throws NotFoundException when user not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('update calls syncRole when role is provided', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue({ ...user, role: Role.MANAGER });
    await service.update('u1', { role: Role.MANAGER });
    expect(mockAuth0Management.syncRole).toHaveBeenCalledWith('auth0|abc', Role.MANAGER);
  });

  it('update does not call syncRole when role is not provided', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(user);
    mockPrisma.user.update.mockResolvedValue({ ...user, name: 'Alice B' });
    await service.update('u1', { name: 'Alice B' });
    expect(mockAuth0Management.syncRole).not.toHaveBeenCalled();
  });
});

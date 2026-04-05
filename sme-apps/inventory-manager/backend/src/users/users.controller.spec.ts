import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Role } from '@prisma/client';

const mockService = { findAll: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() };
const user = { id: 'u1', name: 'Alice', role: Role.STAFF };

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();
    controller = module.get(UsersController);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([user]);
    expect(await controller.findAll()).toEqual([user]);
  });

  it('update delegates to service', async () => {
    mockService.update.mockResolvedValue({ ...user, role: Role.MANAGER });
    await controller.update('u1', { role: Role.MANAGER });
    expect(mockService.update).toHaveBeenCalledWith('u1', { role: Role.MANAGER });
  });
});

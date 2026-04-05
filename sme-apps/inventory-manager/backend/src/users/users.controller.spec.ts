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

  it('create delegates to service', async () => {
    const dto = { auth0Id: 'auth0|123', email: 'a@b.com', name: 'Alice', role: Role.STAFF };
    mockService.create.mockResolvedValue({ id: 'u1', ...dto });
    const result = await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject(dto);
  });

  it('remove delegates to service', async () => {
    mockService.remove.mockResolvedValue({ id: 'u1' });
    const result = await controller.remove('u1');
    expect(mockService.remove).toHaveBeenCalledWith('u1');
    expect(result).toMatchObject({ id: 'u1' });
  });
});

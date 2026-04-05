import { Test } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { Role } from '@prisma/client';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const product = { id: 'p1', name: 'Widget', sku: 'WGT-001', quantity: 10, reorderThreshold: 5 };

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: mockService }],
    }).compile();
    controller = module.get(ProductsController);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([product]);
    const result = await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalledWith(undefined, undefined, false);
    expect(result).toEqual([product]);
  });

  it('findAll passes lowStock=true when query param is "true"', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll(undefined, undefined, 'true');
    expect(mockService.findAll).toHaveBeenCalledWith(undefined, undefined, true);
  });

  it('update passes user role from request', async () => {
    mockService.update.mockResolvedValue(product);
    const req = { user: { role: Role.STAFF } };
    await controller.update('p1', { quantity: 5 }, req as any);
    expect(mockService.update).toHaveBeenCalledWith('p1', { quantity: 5 }, Role.STAFF);
  });
});

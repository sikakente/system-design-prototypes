import { Test } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const product = {
  id: 'p1',
  name: 'Widget',
  sku: 'WGT-001',
  quantity: 10,
  reorderThreshold: 5,
  unit: 'pcs',
  categoryId: 'cat1',
  category: { id: 'cat1', name: 'Electronics' },
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(ProductsService);
  });

  describe('findAll', () => {
    it('returns all products', async () => {
      mockPrisma.product.findMany.mockResolvedValue([product]);
      const result = await service.findAll();
      expect(result).toEqual([product]);
    });

    it('filters low stock products client-side', async () => {
      const lowProduct = { ...product, quantity: 2, reorderThreshold: 5 };
      const okProduct = { ...product, id: 'p2', quantity: 20, reorderThreshold: 5 };
      mockPrisma.product.findMany.mockResolvedValue([lowProduct, okProduct]);
      const result = await service.findAll(undefined, undefined, true);
      expect(result).toEqual([lowProduct]);
    });
  });

  describe('findOne', () => {
    it('returns product when found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(product);
      const result = await service.findOne('p1');
      expect(result).toEqual(product);
    });

    it('throws NotFoundException when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('allows MANAGER to update all fields', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.update.mockResolvedValue({ ...product, name: 'New Name' });
      await service.update('p1', { name: 'New Name', quantity: 5 }, Role.MANAGER);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { name: 'New Name', quantity: 5 } }),
      );
    });

    it('restricts STAFF to quantity field only', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.update.mockResolvedValue({ ...product, quantity: 8 });
      await service.update('p1', { name: 'Renamed', quantity: 8 }, Role.STAFF);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { quantity: 8 } }),
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('calls prisma.product.create with dto', async () => {
      mockPrisma.product.create.mockResolvedValue(product);
      const dto = {
        name: 'Widget',
        sku: 'WGT-001',
        quantity: 10,
        reorderThreshold: 5,
        unit: 'pcs',
        categoryId: 'cat1',
      };
      const result = await service.create(dto);
      expect(mockPrisma.product.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: dto }),
      );
      expect(result).toEqual(product);
    });
  });
});

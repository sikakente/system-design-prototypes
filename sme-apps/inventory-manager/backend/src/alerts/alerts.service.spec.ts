import { Test } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [AlertsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(AlertsService);
  });

  describe('findAll', () => {
    it('returns only products where quantity <= reorderThreshold', async () => {
      const products = [
        { id: 'p1', quantity: 2, reorderThreshold: 5, category: {} },
        { id: 'p2', quantity: 20, reorderThreshold: 5, category: {} },
        { id: 'p3', quantity: 5, reorderThreshold: 5, category: {} },
      ];
      mockPrisma.product.findMany.mockResolvedValue(products);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result.map((p) => p.id)).toEqual(['p1', 'p3']);
    });
  });

  describe('updateThreshold', () => {
    it('throws NotFoundException when product not found', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);
      await expect(service.updateThreshold('missing', 10)).rejects.toThrow(NotFoundException);
    });

    it('updates reorderThreshold', async () => {
      const product = { id: 'p1', quantity: 2, reorderThreshold: 5 };
      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.update.mockResolvedValue({ ...product, reorderThreshold: 15 });
      await service.updateThreshold('p1', 15);
      expect(mockPrisma.product.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { reorderThreshold: 15 } }),
      );
    });
  });
});

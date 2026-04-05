import { Test } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const category = { id: 'cat1', name: 'Electronics', createdAt: new Date(), _count: { products: 3 } };

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(CategoriesService);
  });

  it('findAll returns categories with product counts', async () => {
    mockPrisma.category.findMany.mockResolvedValue([category]);
    const result = await service.findAll();
    expect(result).toEqual([category]);
    expect(mockPrisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: { _count: { select: { products: true } } } }),
    );
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});

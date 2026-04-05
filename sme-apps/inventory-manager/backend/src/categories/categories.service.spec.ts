import { Test } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

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

  it('findOne returns category when found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(category);
    const result = await service.findOne('cat1');
    expect(result).toEqual(category);
  });

  it('create persists and returns the category', async () => {
    mockPrisma.category.create.mockResolvedValue(category);
    const result = await service.create({ name: 'Electronics' });
    expect(mockPrisma.category.create).toHaveBeenCalledWith({ data: { name: 'Electronics' } });
    expect(result).toEqual(category);
  });

  it('create throws ConflictException on duplicate name', async () => {
    mockPrisma.category.create.mockRejectedValue({ code: 'P2002' });
    await expect(service.create({ name: 'Electronics' })).rejects.toThrow(ConflictException);
  });

  it('update throws NotFoundException when not found', async () => {
    mockPrisma.category.findUnique.mockResolvedValue(null);
    await expect(service.update('missing', { name: 'X' })).rejects.toThrow(NotFoundException);
  });

  it('remove throws ConflictException when category has products', async () => {
    mockPrisma.category.findUnique.mockResolvedValue({ ...category, _count: { products: 2 } });
    await expect(service.remove('cat1')).rejects.toThrow(ConflictException);
  });
});

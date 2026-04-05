import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, categoryId?: string, lowStock?: boolean) {
    const products = await this.prisma.product.findMany({
      where: {
        ...(search && { name: { contains: search, mode: 'insensitive' } }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    if (lowStock) {
      return products.filter((p) => p.quantity <= p.reorderThreshold);
    }
    return products;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  create(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto, include: { category: true } });
  }

  async update(id: string, dto: UpdateProductDto, userRole: Role) {
    await this.findOne(id);
    const data = userRole === Role.STAFF ? { quantity: dto.quantity } : dto;
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}

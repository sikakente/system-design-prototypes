import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany({
      include: { category: true },
      orderBy: { quantity: 'asc' },
    });
    return products.filter((p) => p.quantity <= p.reorderThreshold);
  }

  async updateThreshold(productId: string, reorderThreshold: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product ${productId} not found`);
    return this.prisma.product.update({
      where: { id: productId },
      data: { reorderThreshold },
      include: { category: true },
    });
  }
}

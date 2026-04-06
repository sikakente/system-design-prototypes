import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Auth0ManagementService } from '../auth/auth0-management.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private auth0Management: Auth0ManagementService,
  ) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: CreateUserDto) {
    const { auth0Id, email, name, role } = dto;
    return this.prisma.user.create({ data: { auth0Id, email, name, role } });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    const updated = await this.prisma.user.update({ where: { id }, data: dto });
    if (dto.role) {
      await this.auth0Management.syncRole(user.auth0Id, dto.role);
    }
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}

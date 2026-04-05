import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  upsertUser(auth0Id: string, email: string, name: string, role: Role) {
    return this.prisma.user.upsert({
      where: { auth0Id },
      update: { email, name },
      create: { auth0Id, email, name, role },
    });
  }
}

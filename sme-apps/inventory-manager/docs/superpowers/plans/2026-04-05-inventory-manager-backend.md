# Inventory Manager Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a NestJS REST API with Prisma/PostgreSQL and Auth0 JWT validation serving products, categories, alerts, and team management endpoints.

**Architecture:** NestJS app with one module per resource. Auth0 JWKS validates JWTs via a Passport strategy; a global `JwtAuthGuard` protects all routes; a `RolesGuard` enforces per-endpoint role requirements. Prisma is a global module injected into every service.

**Tech Stack:** NestJS 10, Prisma 5, PostgreSQL, `passport-jwt`, `jwks-rsa`, `class-validator`, `class-transformer`, Jest

---

## File Map

```
backend/
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env                              # DATABASE_URL, AUTH0_DOMAIN, AUTH0_AUDIENCE, FRONTEND_URL
├── .env.test                         # TEST_DATABASE_URL
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── prisma.service.spec.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth0.strategy.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.controller.spec.ts
│   │   ├── auth.service.ts
│   │   ├── auth.service.spec.ts
│   │   ├── decorators/
│   │   │   ├── public.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── guards/
│   │       ├── jwt-auth.guard.ts
│   │       └── roles.guard.ts
│   ├── products/
│   │   ├── products.module.ts
│   │   ├── products.controller.ts
│   │   ├── products.controller.spec.ts
│   │   ├── products.service.ts
│   │   ├── products.service.spec.ts
│   │   └── dto/
│   │       ├── create-product.dto.ts
│   │       └── update-product.dto.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.controller.spec.ts
│   │   ├── categories.service.ts
│   │   ├── categories.service.spec.ts
│   │   └── dto/
│   │       ├── create-category.dto.ts
│   │       └── update-category.dto.ts
│   ├── alerts/
│   │   ├── alerts.module.ts
│   │   ├── alerts.controller.ts
│   │   ├── alerts.service.ts
│   │   └── alerts.service.spec.ts
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.controller.spec.ts
│       ├── users.service.ts
│       ├── users.service.spec.ts
│       └── dto/
│           ├── create-user.dto.ts
│           └── update-user.dto.ts
└── test/
    └── app.e2e-spec.ts
```

---

## Task 1: Scaffold NestJS Project

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env`
- Create: `backend/.env.test`

- [ ] **Step 1: Scaffold the project**

```bash
cd inventory-manager
npm install -g @nestjs/cli
nest new backend --package-manager npm --skip-git
cd backend
```

Expected: NestJS boilerplate created with `src/app.module.ts`, `src/main.ts`, etc.

- [ ] **Step 2: Install dependencies**

```bash
npm install @nestjs/passport passport passport-jwt jwks-rsa @nestjs/mapped-types class-validator class-transformer
npm install --save-dev @types/passport-jwt
```

- [ ] **Step 3: Create `.env`**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://inventory-api
FRONTEND_URL=http://localhost:3000
PORT=3001
```

- [ ] **Step 4: Create `.env.test`**

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_test
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://inventory-api
```

- [ ] **Step 5: Delete the generated boilerplate files not needed**

```bash
rm src/app.controller.ts src/app.controller.spec.ts src/app.service.ts
```

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): scaffold NestJS project"
```

---

## Task 2: Prisma Setup

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/prisma/prisma.module.ts`
- Create: `backend/src/prisma/prisma.service.spec.ts`

- [ ] **Step 1: Install Prisma**

```bash
cd backend
npm install prisma @prisma/client
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` and `.env` updated with `DATABASE_URL`.

- [ ] **Step 2: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  auth0Id   String   @unique
  email     String   @unique
  name      String
  role      Role     @default(STAFF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  products  Product[]
  createdAt DateTime  @default(now())
}

model Product {
  id               String   @id @default(cuid())
  name             String
  sku              String   @unique
  quantity         Int      @default(0)
  reorderThreshold Int      @default(10)
  unit             String?
  categoryId       String
  category         Category @relation(fields: [categoryId], references: [id])
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

enum Role {
  ADMIN
  MANAGER
  STAFF
}
```

- [ ] **Step 3: Run the migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration applied, `prisma/migrations/` directory created, Prisma Client generated.

- [ ] **Step 4: Write `src/prisma/prisma.service.ts`**

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

- [ ] **Step 5: Write `src/prisma/prisma.module.ts`**

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

- [ ] **Step 6: Write `src/prisma/prisma.service.spec.ts`**

```typescript
import { Test } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();
    service = module.get(PrismaService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });
});
```

- [ ] **Step 7: Run the test**

```bash
npm test -- prisma.service.spec
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(backend): add Prisma schema and service"
```

---

## Task 3: Auth Infrastructure

**Files:**
- Create: `backend/src/auth/decorators/public.decorator.ts`
- Create: `backend/src/auth/decorators/roles.decorator.ts`
- Create: `backend/src/auth/guards/jwt-auth.guard.ts`
- Create: `backend/src/auth/guards/roles.guard.ts`
- Create: `backend/src/auth/auth0.strategy.ts`

- [ ] **Step 1: Write `src/auth/decorators/public.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 2: Write `src/auth/decorators/roles.decorator.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

- [ ] **Step 3: Write `src/auth/guards/jwt-auth.guard.ts`**

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

- [ ] **Step 4: Write `src/auth/guards/roles.guard.ts`**

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user?.role);
  }
}
```

- [ ] **Step 5: Write `src/auth/auth0.strategy.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Record<string, unknown>) {
    return {
      sub: payload.sub as string,
      email: (payload['https://inventory/email'] ?? payload.email) as string,
      name: (payload['https://inventory/name'] ?? payload.name) as string,
      role: (
        (payload['https://inventory/role'] as string | undefined)?.toUpperCase() ?? 'STAFF'
      ) as string,
    };
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/auth/
git commit -m "feat(backend): add Auth0 strategy, guards, and decorators"
```

---

## Task 4: Auth Module

**Files:**
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/auth.service.spec.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/auth/auth.controller.spec.ts`
- Create: `backend/src/auth/auth.module.ts`

- [ ] **Step 1: Write failing test for `AuthService`**

```typescript
// src/auth/auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: { upsert: jest.fn() },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('upserts user with correct payload', async () => {
    const user = {
      id: 'u1',
      auth0Id: 'auth0|abc',
      email: 'a@b.com',
      name: 'Alice',
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.user.upsert.mockResolvedValue(user);

    const result = await service.upsertUser('auth0|abc', 'a@b.com', 'Alice', Role.STAFF);

    expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
      where: { auth0Id: 'auth0|abc' },
      update: { email: 'a@b.com', name: 'Alice', role: Role.STAFF },
      create: { auth0Id: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: Role.STAFF },
    });
    expect(result).toEqual(user);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- auth.service.spec
```

Expected: FAIL with "Cannot find module './auth.service'"

- [ ] **Step 3: Write `src/auth/auth.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  upsertUser(auth0Id: string, email: string, name: string, role: Role) {
    return this.prisma.user.upsert({
      where: { auth0Id },
      update: { email, name, role },
      create: { auth0Id, email, name, role },
    });
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- auth.service.spec
```

Expected: PASS

- [ ] **Step 5: Write failing test for `AuthController`**

```typescript
// src/auth/auth.controller.spec.ts
import { Test } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

const mockAuthService = { upsertUser: jest.fn() };

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get(AuthController);
  });

  it('calls upsertUser with JWT payload and returns user', async () => {
    const user = {
      id: 'u1',
      auth0Id: 'auth0|abc',
      email: 'a@b.com',
      name: 'Alice',
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockAuthService.upsertUser.mockResolvedValue(user);

    const req = { user: { sub: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: 'STAFF' } };
    const result = await controller.me(req as any);

    expect(mockAuthService.upsertUser).toHaveBeenCalledWith('auth0|abc', 'a@b.com', 'Alice', 'STAFF');
    expect(result).toEqual(user);
  });
});
```

- [ ] **Step 6: Run test — expect FAIL**

```bash
npm test -- auth.controller.spec
```

Expected: FAIL with "Cannot find module './auth.controller'"

- [ ] **Step 7: Write `src/auth/auth.controller.ts`**

```typescript
import { Controller, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

interface JwtUser {
  sub: string;
  email: string;
  name: string;
  role: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  me(@Req() req: { user: JwtUser }) {
    const { sub, email, name, role } = req.user;
    return this.authService.upsertUser(sub, email, name, role as Role);
  }
}
```

- [ ] **Step 8: Run tests — expect PASS**

```bash
npm test -- auth.controller.spec
```

Expected: PASS

- [ ] **Step 9: Write `src/auth/auth.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth0Strategy } from './auth0.strategy';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, Auth0Strategy],
})
export class AuthModule {}
```

- [ ] **Step 10: Commit**

```bash
git add src/auth/
git commit -m "feat(backend): add auth module with Auth0 JWT strategy"
```

---

## Task 5: Products Module

**Files:**
- Create: `backend/src/products/dto/create-product.dto.ts`
- Create: `backend/src/products/dto/update-product.dto.ts`
- Create: `backend/src/products/products.service.ts`
- Create: `backend/src/products/products.service.spec.ts`
- Create: `backend/src/products/products.controller.ts`
- Create: `backend/src/products/products.controller.spec.ts`
- Create: `backend/src/products/products.module.ts`

- [ ] **Step 1: Write DTOs**

```typescript
// src/products/dto/create-product.dto.ts
import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() sku: string;
  @IsInt() @Min(0) quantity: number;
  @IsInt() @Min(0) reorderThreshold: number;
  @IsOptional() @IsString() unit?: string;
  @IsString() categoryId: string;
}
```

```typescript
// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

- [ ] **Step 2: Write failing tests for `ProductsService`**

```typescript
// src/products/products.service.spec.ts
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
});
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npm test -- products.service.spec
```

Expected: FAIL with "Cannot find module './products.service'"

- [ ] **Step 4: Write `src/products/products.service.ts`**

```typescript
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
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- products.service.spec
```

Expected: PASS (4 tests)

- [ ] **Step 6: Write failing tests for `ProductsController`**

```typescript
// src/products/products.controller.spec.ts
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
```

- [ ] **Step 7: Run test — expect FAIL**

```bash
npm test -- products.controller.spec
```

Expected: FAIL with "Cannot find module './products.controller'"

- [ ] **Step 8: Write `src/products/products.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    return this.productsService.findAll(search, categoryId, lowStock === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.MANAGER, Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: { user: { role: Role } },
  ) {
    return this.productsService.update(id, dto, req.user.role);
  }

  @Delete(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

- [ ] **Step 9: Run tests — expect PASS**

```bash
npm test -- products.controller.spec
```

Expected: PASS

- [ ] **Step 10: Write `src/products/products.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
```

- [ ] **Step 11: Commit**

```bash
git add src/products/
git commit -m "feat(backend): add products module"
```

---

## Task 6: Categories Module

**Files:**
- Create: `backend/src/categories/dto/create-category.dto.ts`
- Create: `backend/src/categories/dto/update-category.dto.ts`
- Create: `backend/src/categories/categories.service.ts`
- Create: `backend/src/categories/categories.service.spec.ts`
- Create: `backend/src/categories/categories.controller.ts`
- Create: `backend/src/categories/categories.controller.spec.ts`
- Create: `backend/src/categories/categories.module.ts`

- [ ] **Step 1: Write DTOs**

```typescript
// src/categories/dto/create-category.dto.ts
import { IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString() name: string;
}
```

```typescript
// src/categories/dto/update-category.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './create-category.dto';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
```

- [ ] **Step 2: Write failing tests for `CategoriesService`**

```typescript
// src/categories/categories.service.spec.ts
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
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm test -- categories.service.spec
```

Expected: FAIL with "Cannot find module './categories.service'"

- [ ] **Step 4: Write `src/categories/categories.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }
}
```

- [ ] **Step 5: Run test — expect PASS**

```bash
npm test -- categories.service.spec
```

Expected: PASS

- [ ] **Step 6: Write failing tests for `CategoriesController`**

```typescript
// src/categories/categories.controller.spec.ts
import { Test } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();
    controller = module.get(CategoriesController);
  });

  it('findAll delegates to service', async () => {
    mockService.findAll.mockResolvedValue([]);
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('create delegates to service', async () => {
    const dto = { name: 'Electronics' };
    mockService.create.mockResolvedValue({ id: 'cat1', ...dto });
    const result = await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toMatchObject(dto);
  });
});
```

- [ ] **Step 7: Run test — expect FAIL**

```bash
npm test -- categories.controller.spec
```

Expected: FAIL

- [ ] **Step 8: Write `src/categories/categories.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @Roles(Role.MANAGER, Role.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.MANAGER, Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
```

- [ ] **Step 9: Run tests — expect PASS**

```bash
npm test -- categories.controller.spec
```

Expected: PASS

- [ ] **Step 10: Write `src/categories/categories.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
```

- [ ] **Step 11: Commit**

```bash
git add src/categories/
git commit -m "feat(backend): add categories module"
```

---

## Task 7: Alerts Module

**Files:**
- Create: `backend/src/alerts/alerts.service.ts`
- Create: `backend/src/alerts/alerts.service.spec.ts`
- Create: `backend/src/alerts/alerts.controller.ts`
- Create: `backend/src/alerts/alerts.module.ts`

- [ ] **Step 1: Write failing tests for `AlertsService`**

```typescript
// src/alerts/alerts.service.spec.ts
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
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- alerts.service.spec
```

Expected: FAIL

- [ ] **Step 3: Write `src/alerts/alerts.service.ts`**

```typescript
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
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- alerts.service.spec
```

Expected: PASS

- [ ] **Step 5: Write `src/alerts/alerts.controller.ts`**

```typescript
import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { IsInt, Min } from 'class-validator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

class UpdateThresholdDto {
  @IsInt() @Min(0) reorderThreshold: number;
}

@Controller('alerts')
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  findAll() {
    return this.alertsService.findAll();
  }

  @Patch(':productId')
  @Roles(Role.MANAGER, Role.ADMIN)
  updateThreshold(@Param('productId') productId: string, @Body() dto: UpdateThresholdDto) {
    return this.alertsService.updateThreshold(productId, dto.reorderThreshold);
  }
}
```

- [ ] **Step 6: Write `src/alerts/alerts.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
```

- [ ] **Step 7: Commit**

```bash
git add src/alerts/
git commit -m "feat(backend): add alerts module"
```

---

## Task 8: Users Module

**Files:**
- Create: `backend/src/users/dto/create-user.dto.ts`
- Create: `backend/src/users/dto/update-user.dto.ts`
- Create: `backend/src/users/users.service.ts`
- Create: `backend/src/users/users.service.spec.ts`
- Create: `backend/src/users/users.controller.ts`
- Create: `backend/src/users/users.controller.spec.ts`
- Create: `backend/src/users/users.module.ts`

- [ ] **Step 1: Write DTOs**

```typescript
// src/users/dto/create-user.dto.ts
import { IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString() auth0Id: string;
  @IsEmail() email: string;
  @IsString() name: string;
  @IsEnum(Role) role: Role;
}
```

```typescript
// src/users/dto/update-user.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
}
```

- [ ] **Step 2: Write failing tests for `UsersService`**

```typescript
// src/users/users.service.spec.ts
import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

const user = { id: 'u1', auth0Id: 'auth0|abc', email: 'a@b.com', name: 'Alice', role: Role.STAFF, createdAt: new Date(), updatedAt: new Date() };

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get(UsersService);
  });

  it('findAll returns users', async () => {
    mockPrisma.user.findMany.mockResolvedValue([user]);
    expect(await service.findAll()).toEqual([user]);
  });

  it('findOne throws NotFoundException when not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('remove throws NotFoundException when not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
  });
});
```

- [ ] **Step 3: Run test — expect FAIL**

```bash
npm test -- users.service.spec
```

Expected: FAIL

- [ ] **Step 4: Write `src/users/users.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: CreateUserDto) {
    return this.prisma.user.create({ data: dto });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- users.service.spec
```

Expected: PASS

- [ ] **Step 6: Write failing tests for `UsersController`**

```typescript
// src/users/users.controller.spec.ts
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
});
```

- [ ] **Step 7: Run test — expect FAIL**

```bash
npm test -- users.controller.spec
```

Expected: FAIL

- [ ] **Step 8: Write `src/users/users.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('users')
@Roles(Role.MANAGER, Role.ADMIN)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

- [ ] **Step 9: Run tests — expect PASS**

```bash
npm test -- users.controller.spec
```

Expected: PASS

- [ ] **Step 10: Write `src/users/users.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

- [ ] **Step 11: Commit**

```bash
git add src/users/
git commit -m "feat(backend): add users module"
```

---

## Task 9: Wire App Module and main.ts

**Files:**
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/main.ts`

- [ ] **Step 1: Write `src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AlertsModule } from './alerts/alerts.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule, ProductsModule, CategoriesModule, AlertsModule, UsersModule],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Write `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

- [ ] **Step 3: Run all unit tests**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 4: Start the dev server to verify it compiles**

```bash
npm run start:dev
```

Expected: Server starts on port 3001 with no errors. `GET http://localhost:3001/products` returns 401 (no token).

- [ ] **Step 5: Commit**

```bash
git add src/app.module.ts src/main.ts
git commit -m "feat(backend): wire app module with global guards and validation"
```

---

## Task 10: E2E Smoke Test

**Files:**
- Modify: `backend/test/app.e2e-spec.ts`

- [ ] **Step 1: Write E2E test**

```typescript
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products returns 401 without token', () => {
    return request(app.getHttpServer()).get('/products').expect(401);
  });

  it('GET /categories returns 401 without token', () => {
    return request(app.getHttpServer()).get('/categories').expect(401);
  });

  it('GET /alerts returns 401 without token', () => {
    return request(app.getHttpServer()).get('/alerts').expect(401);
  });

  it('GET /users returns 401 without token', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });
});
```

- [ ] **Step 2: Add supertest**

```bash
npm install --save-dev supertest @types/supertest
```

- [ ] **Step 3: Configure test database in `jest-e2e.json`**

Ensure `package.json` has the following (NestJS adds this by default):
```json
"jest": {
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

- [ ] **Step 4: Run E2E tests**

```bash
DATABASE_URL=$(grep DATABASE_URL .env.test | cut -d= -f2) npm run test:e2e
```

Expected: All 4 tests PASS (401 responses confirm global JWT guard is active)

- [ ] **Step 5: Commit**

```bash
git add test/
git commit -m "feat(backend): add E2E smoke tests for auth guard coverage"
```

---

## Task 11: Root Dev Script

**Files:**
- Create/Modify: `inventory-manager/package.json` (root)

- [ ] **Step 1: Create root `package.json`**

```json
{
  "name": "inventory-manager",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix frontend\" \"npm run start:dev --prefix backend\"",
    "test:backend": "npm test --prefix backend",
    "test:frontend": "npm test --prefix frontend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

- [ ] **Step 2: Install concurrently**

```bash
cd /path/to/inventory-manager
npm install
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add root package.json with concurrently dev script"
```

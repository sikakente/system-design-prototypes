// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Auth0Strategy } from '../src/auth/auth0.strategy';

// A minimal JWT strategy that uses a local secret — in tests there is no
// real token so every request will be rejected with 401, which is what we
// want to verify that the global guard is active.
class MockAuth0Strategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'test-secret',
    });
  }

  validate(payload: Record<string, unknown>) {
    return payload;
  }
}

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        product: {},
        category: {},
        alert: {},
        user: {},
      })
      .overrideProvider(Auth0Strategy)
      .useClass(MockAuth0Strategy)
      .compile();

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

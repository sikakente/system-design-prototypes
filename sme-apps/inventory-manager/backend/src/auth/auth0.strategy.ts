import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
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

  async validate(payload: any) {
    const auth0Id = payload.sub;
    const claimRole = (payload['https://inventory/role'] as Role) ?? Role.STAFF;

    const dbUser = await this.prisma.user.findUnique({ where: { auth0Id } });

    return {
      auth0Id,
      email: payload['https://inventory/email'] ?? payload.email,
      name: payload['https://inventory/name'] ?? payload.name,
      role: dbUser?.role ?? claimRole,  // DB role wins; falls back to JWT claim
    };
  }
}

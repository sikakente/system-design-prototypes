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

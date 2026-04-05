import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth0Strategy } from './auth0.strategy';
import { Auth0ManagementService } from './auth0-management.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [AuthController],
  providers: [AuthService, Auth0Strategy, Auth0ManagementService],
  exports: [Auth0ManagementService],
})
export class AuthModule {}

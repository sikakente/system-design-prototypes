import { IsString, IsEmail, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @IsString() auth0Id: string;
  @IsEmail() email: string;
  @IsString() name: string;
  @IsEnum(Role) role: Role;
}

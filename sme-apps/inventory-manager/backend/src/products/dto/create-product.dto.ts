import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString() name: string;
  @IsString() sku: string;
  @IsInt() @Min(0) quantity: number;
  @IsInt() @Min(0) reorderThreshold: number;
  @IsOptional() @IsString() unit?: string;
  @IsString() categoryId: string;
}

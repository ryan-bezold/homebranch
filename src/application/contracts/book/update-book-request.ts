import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBookRequest {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsNumber()
  publishedYear?: number;

  @IsOptional()
  isFavorite?: boolean;
}

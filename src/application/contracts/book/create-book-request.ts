import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookRequest {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Invalid title' })
  title: string;

  @IsNotEmpty({ message: 'Author is required' })
  @IsString({ message: 'Invalid author' })
  author: string;

  @IsOptional()
  isFavorite?: boolean;

  @IsOptional()
  @IsString({ message: 'Invalid Published Year' })
  publishedYear?: string;

  @IsOptional()
  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  coverImageFileName?: string;

  uploadedByUserId: string;
}

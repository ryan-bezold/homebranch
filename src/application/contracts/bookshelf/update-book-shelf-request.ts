import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateBookShelfRequest {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsString()
  title?: string;
}

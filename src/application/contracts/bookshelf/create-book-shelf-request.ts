import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookShelfRequest {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Invalid title' })
  title: string;
}

import { IsUUID } from 'class-validator';

export class AddBookToBookShelfRequest {
  @IsUUID()
  bookShelfId: string;

  @IsUUID()
  bookId: string;
}

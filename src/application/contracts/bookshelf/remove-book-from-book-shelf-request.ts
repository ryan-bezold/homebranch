import { IsUUID } from 'class-validator';

export class RemoveBookFromBookShelfRequest {
  @IsUUID()
  bookShelfId: string;

  @IsUUID()
  bookId: string;
}

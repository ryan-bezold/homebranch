import { IsUUID } from 'class-validator';

export class GetBookShelfBooksRequest {
  @IsUUID()
  id: string;
}

import { IsUUID } from 'class-validator';

export class DeleteBookShelfRequest {
  @IsUUID()
  id: string;
}

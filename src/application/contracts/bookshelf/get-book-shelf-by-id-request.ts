import { IsUUID } from 'class-validator';

export class GetBookShelfByIdRequest {
  @IsUUID()
  id: string;
}

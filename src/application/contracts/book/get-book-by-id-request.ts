import { IsUUID } from 'class-validator';

export class GetBookByIdRequest {
  @IsUUID()
  id: string;
}

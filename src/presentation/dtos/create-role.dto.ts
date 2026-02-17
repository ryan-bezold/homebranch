import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Permission } from 'src/domain/value-objects/permission.enum';

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Invalid name' })
  name: string;

  @IsArray({ message: 'Permissions must be an array' })
  permissions: Permission[];
}

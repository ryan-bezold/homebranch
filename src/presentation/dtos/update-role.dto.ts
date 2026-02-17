import { IsArray } from 'class-validator';
import { Permission } from 'src/domain/value-objects/permission.enum';

export class UpdateRoleDto {
  @IsArray({ message: 'Permissions must be an array' })
  permissions: Permission[];
}

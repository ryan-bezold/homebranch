import { IsNotEmpty, IsString } from 'class-validator';

export class AssignRoleDto {
  @IsNotEmpty({ message: 'Role ID is required' })
  @IsString({ message: 'Invalid role ID' })
  roleId: string;
}

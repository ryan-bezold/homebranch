import { Permission } from 'src/domain/value-objects/permission.enum';

export class UpdateRoleRequest {
  id: string;
  permissions: Permission[];
}

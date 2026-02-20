import { Permission } from 'src/domain/value-objects/permission.enum';
import { Role } from 'src/domain/entities/role.entity';

export class RoleFactory {
  static create(id: string, name: string, permissions: Permission[]): Role {
    if (!name) {
      throw new Error('Name is required to create a role.');
    }

    return new Role(id, name, permissions);
  }
}

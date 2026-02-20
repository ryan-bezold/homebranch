import { RoleEntity } from 'src/infrastructure/database/role.entity';
import { Role } from 'src/domain/entities/role.entity';
import { RoleFactory } from 'src/domain/entities/role.factory';
import { Permission } from 'src/domain/value-objects/permission.enum';

export class RoleMapper {
  static toDomain(roleEntity: RoleEntity): Role {
    return RoleFactory.create(
      roleEntity.id,
      roleEntity.name,
      roleEntity.permissions as Permission[],
    );
  }

  static toPersistence(role: Role): RoleEntity {
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions,
    } as RoleEntity;
  }

  static toDomainList(roleEntityList: RoleEntity[]): Role[] {
    return roleEntityList.map((roleEntity) => this.toDomain(roleEntity));
  }
}

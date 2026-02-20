import { UserEntity } from 'src/infrastructure/database/user.entity';
import { User } from 'src/domain/entities/user.entity';
import { UserFactory } from 'src/domain/entities/user.factory';
import { RoleMapper } from './role.mapper';

export class UserMapper {
  static toDomain(userEntity: UserEntity): User {
    return UserFactory.create(
      userEntity.id,
      userEntity.username,
      userEntity.email,
      userEntity.isRestricted,
      userEntity.role ? RoleMapper.toDomain(userEntity.role) : undefined,
    );
  }

  static toPersistence(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.username = user.username;
    entity.email = user.email;
    entity.isRestricted = user.isRestricted;
    if (user.role) {
      entity.role = RoleMapper.toPersistence(user.role);
    }
    return entity;
  }

  static toDomainList(userEntityList: UserEntity[]): User[] {
    return userEntityList.map((userEntity) => this.toDomain(userEntity));
  }
}

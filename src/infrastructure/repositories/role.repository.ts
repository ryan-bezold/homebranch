import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result } from 'src/core/result';
import { IRoleRepository } from 'src/application/interfaces/role-repository';
import { RoleEntity } from 'src/infrastructure/database/role.entity';
import { Role } from 'src/domain/entities/role.entity';
import { RoleMapper } from '../mappers/role.mapper';
import { RoleNotFoundFailure } from 'src/domain/failures/role.failures';

@Injectable()
export class TypeOrmRoleRepository implements IRoleRepository {
  constructor(
    @InjectRepository(RoleEntity) private repository: Repository<RoleEntity>,
  ) {}

  async findAll(): Promise<Result<Role[]>> {
    const roleEntities = await this.repository.find();
    return Result.success(RoleMapper.toDomainList(roleEntities));
  }

  async findById(id: string): Promise<Result<Role>> {
    const roleEntity = await this.repository.findOne({ where: { id } });
    if (roleEntity) return Result.success(RoleMapper.toDomain(roleEntity));
    return Result.failure(new RoleNotFoundFailure());
  }

  async findByName(name: string): Promise<Result<Role>> {
    const roleEntity = await this.repository.findOne({ where: { name } });
    if (roleEntity) return Result.success(RoleMapper.toDomain(roleEntity));
    return Result.failure(new RoleNotFoundFailure());
  }

  async create(entity: Role): Promise<Result<Role>> {
    const roleEntity = RoleMapper.toPersistence(entity);
    const savedEntity = await this.repository.save(roleEntity);
    return Result.success(RoleMapper.toDomain(savedEntity));
  }

  async update(id: string, role: Role): Promise<Result<Role>> {
    const exists = await this.repository.existsBy({ id });
    if (!exists) return Result.failure(new RoleNotFoundFailure());

    const roleEntity = RoleMapper.toPersistence(role);
    await this.repository.save(roleEntity);
    return Result.success(RoleMapper.toDomain(roleEntity));
  }

  async delete(id: string): Promise<Result<Role>> {
    const findResult = await this.findById(id);
    if (!findResult.isSuccess()) {
      return Result.failure(new RoleNotFoundFailure());
    }

    const role = findResult.getValue();
    await this.repository.delete(id);
    return Result.success(role);
  }
}

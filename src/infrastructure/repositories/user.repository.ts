import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { IUserRepository } from 'src/application/interfaces/user-repository';
import { UserEntity } from 'src/infrastructure/database/user.entity';
import { User } from 'src/domain/entities/user.entity';
import { UserMapper } from '../mappers/user.mapper';
import { UserNotFoundFailure } from 'src/domain/failures/user.failures';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
  ) {}

  async findAll(
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<User[]>>> {
    const [userEntities, total] = await this.repository.findAndCount({
      relations: ['role'],
      take: limit,
      skip: offset,
    });

    return Result.success({
      data: UserMapper.toDomainList(userEntities),
      limit,
      offset,
      total,
      nextCursor:
        limit && total > (offset ?? 0) + limit ? (offset ?? 0) + limit : null,
    });
  }

  async findById(id: string): Promise<Result<User>> {
    const userEntity = await this.repository.findOne({
      where: { id },
      relations: ['role'],
    });
    if (userEntity) return Result.success(UserMapper.toDomain(userEntity));
    return Result.failure(new UserNotFoundFailure());
  }

  async create(entity: User): Promise<Result<User>> {
    const userEntity = UserMapper.toPersistence(entity);
    const savedEntity = await this.repository.save(userEntity);
    const result = await this.repository.findOne({
      where: { id: savedEntity.id },
      relations: ['role'],
    });
    return Result.success(UserMapper.toDomain(result!));
  }

  async update(id: string, user: User): Promise<Result<User>> {
    const exists = await this.repository.existsBy({ id });
    if (!exists) return Result.failure(new UserNotFoundFailure());

    const userEntity = UserMapper.toPersistence(user);
    await this.repository.save(userEntity);

    const result = await this.repository.findOne({
      where: { id },
      relations: ['role'],
    });
    return Result.success(UserMapper.toDomain(result!));
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countByRoleId(roleId: string): Promise<number> {
    return await this.repository.count({
      where: { role: { id: roleId } },
    });
  }
}

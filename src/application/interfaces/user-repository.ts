import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { User } from 'src/domain/entities/user.entity';

export interface IUserRepository {
  findAll(
    limit?: number,
    offset?: number,
  ): Promise<Result<PaginationResult<User[]>>>;
  findById(id: string): Promise<Result<User>>;
  create(entity: User): Promise<Result<User>>;
  update(id: string, entity: User): Promise<Result<User>>;
  count(): Promise<number>;
  countByRoleId(roleId: string): Promise<number>;
}

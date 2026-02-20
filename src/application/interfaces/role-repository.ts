import { Result } from 'src/core/result';
import { Role } from 'src/domain/entities/role.entity';

export interface IRoleRepository {
  findAll(): Promise<Result<Role[]>>;
  findById(id: string): Promise<Result<Role>>;
  findByName(name: string): Promise<Result<Role>>;
  create(entity: Role): Promise<Result<Role>>;
  update(id: string, entity: Role): Promise<Result<Role>>;
  delete(id: string): Promise<Result<Role>>;
}

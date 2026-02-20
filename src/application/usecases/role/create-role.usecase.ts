import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from '../../interfaces/role-repository';
import { CreateRoleRequest } from '../../contracts/role/create-role-request';
import { RoleFactory } from 'src/domain/entities/role.factory';
import { DuplicateRoleNameFailure } from 'src/domain/failures/role.failures';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateRoleUseCase implements UseCase<CreateRoleRequest, Role> {
  constructor(
    @Inject('RoleRepository') private roleRepository: IRoleRepository,
  ) {}

  async execute(request: CreateRoleRequest): Promise<Result<Role>> {
    const existingRole = await this.roleRepository.findByName(request.name);
    if (existingRole.isSuccess()) {
      return Result.failure(new DuplicateRoleNameFailure());
    }

    const role = RoleFactory.create(
      randomUUID(),
      request.name,
      request.permissions,
    );

    return await this.roleRepository.create(role);
  }
}

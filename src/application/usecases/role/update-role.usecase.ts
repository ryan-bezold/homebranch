import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from '../../interfaces/role-repository';
import { UpdateRoleRequest } from '../../contracts/role/update-role-request';

@Injectable()
export class UpdateRoleUseCase implements UseCase<UpdateRoleRequest, Role> {
  constructor(
    @Inject('RoleRepository') private roleRepository: IRoleRepository,
  ) {}

  async execute(request: UpdateRoleRequest): Promise<Result<Role>> {
    const findResult = await this.roleRepository.findById(request.id);

    if (!findResult.isSuccess()) {
      return findResult;
    }

    const role = findResult.getValue();
    role.permissions = request.permissions;

    return await this.roleRepository.update(request.id, role);
  }
}

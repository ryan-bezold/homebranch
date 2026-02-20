import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from '../../interfaces/role-repository';
import { IUserRepository } from '../../interfaces/user-repository';
import { DeleteRoleRequest } from '../../contracts/role/delete-role-request';
import { RoleHasAssignedUsersFailure } from 'src/domain/failures/role.failures';

@Injectable()
export class DeleteRoleUseCase implements UseCase<DeleteRoleRequest, Role> {
  constructor(
    @Inject('RoleRepository') private roleRepository: IRoleRepository,
    @Inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(request: DeleteRoleRequest): Promise<Result<Role>> {
    const findResult = await this.roleRepository.findById(request.id);

    if (!findResult.isSuccess()) {
      return findResult;
    }

    const userCount = await this.userRepository.countByRoleId(request.id);
    if (userCount > 0) {
      return Result.failure(new RoleHasAssignedUsersFailure());
    }

    return await this.roleRepository.delete(request.id);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from '../../interfaces/user-repository';
import { IRoleRepository } from '../../interfaces/role-repository';
import { AssignRoleRequest } from '../../contracts/user/assign-role-request';

@Injectable()
export class AssignRoleUseCase implements UseCase<AssignRoleRequest, User> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
    @Inject('RoleRepository') private roleRepository: IRoleRepository,
  ) {}

  async execute(request: AssignRoleRequest): Promise<Result<User>> {
    const findUserResult = await this.userRepository.findById(request.userId);
    if (!findUserResult.isSuccess()) {
      return findUserResult;
    }

    const findRoleResult = await this.roleRepository.findById(request.roleId);
    if (!findRoleResult.isSuccess()) {
      return Result.failure(findRoleResult.getFailure());
    }

    const user = findUserResult.getValue();
    user.role = findRoleResult.getValue();

    return await this.userRepository.update(request.userId, user);
  }
}

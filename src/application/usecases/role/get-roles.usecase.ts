import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { Role } from 'src/domain/entities/role.entity';
import { IRoleRepository } from '../../interfaces/role-repository';

@Injectable()
export class GetRolesUseCase implements UseCase<void, Role[]> {
  constructor(
    @Inject('RoleRepository') private roleRepository: IRoleRepository,
  ) {}

  async execute(): Promise<Result<Role[]>> {
    return await this.roleRepository.findAll();
  }
}

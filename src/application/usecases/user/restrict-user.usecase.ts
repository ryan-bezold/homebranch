import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from '../../interfaces/user-repository';
import { RestrictUserRequest } from '../../contracts/user/restrict-user-request';

@Injectable()
export class RestrictUserUseCase implements UseCase<RestrictUserRequest, User> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute(request: RestrictUserRequest): Promise<Result<User>> {
    const findResult = await this.userRepository.findById(request.id);

    if (!findResult.isSuccess()) {
      return findResult;
    }

    const user = findResult.getValue();
    user.isRestricted = true;

    return await this.userRepository.update(request.id, user);
  }
}

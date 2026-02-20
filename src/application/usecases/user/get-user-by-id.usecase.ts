import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from '../../interfaces/user-repository';

@Injectable()
export class GetUserByIdUseCase implements UseCase<{ id: string }, User> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute({ id }: { id: string }): Promise<Result<User>> {
    return await this.userRepository.findById(id);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { UseCase } from 'src/core/usecase';
import { PaginatedQuery } from 'src/core/paginated-query';
import { User } from 'src/domain/entities/user.entity';
import { IUserRepository } from '../../interfaces/user-repository';

@Injectable()
export class GetUsersUseCase
  implements UseCase<PaginatedQuery, PaginationResult<User[]>>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
  ) {}

  async execute({
    limit,
    offset,
  }: PaginatedQuery): Promise<Result<PaginationResult<User[]>>> {
    return await this.userRepository.findAll(limit, offset);
  }
}

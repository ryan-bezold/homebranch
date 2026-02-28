import { Inject, Injectable } from '@nestjs/common';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { Author } from 'src/domain/entities/author.entity';
import { Result } from 'src/core/result';
import { PaginationResult } from 'src/core/pagination_result';
import { UseCase } from 'src/core/usecase';
import { GetAuthorsRequest } from 'src/application/contracts/author/get-authors-request';

@Injectable()
export class GetAuthorsUseCase
  implements UseCase<GetAuthorsRequest, PaginationResult<Author[]>>
{
  constructor(
    @Inject('AuthorRepository') private authorRepository: IAuthorRepository,
  ) {}

  async execute({
    query,
    limit,
    offset,
    userId,
  }: GetAuthorsRequest): Promise<Result<PaginationResult<Author[]>>> {
    return await this.authorRepository.findAll(query, limit, offset, userId);
  }
}

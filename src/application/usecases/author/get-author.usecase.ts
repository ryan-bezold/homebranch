import { Inject, Injectable } from '@nestjs/common';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { GetAuthorRequest } from 'src/application/contracts/author/get-author-request';
import { Author } from 'src/domain/entities/author.entity';
import { AuthorFactory } from 'src/domain/entities/author.factory';
import { OpenLibraryGateway } from 'src/infrastructure/gateways/open-library.gateway';
import { randomUUID } from 'crypto';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class GetAuthorUseCase implements UseCase<GetAuthorRequest, Author> {
  constructor(
    @Inject('AuthorRepository') private authorRepository: IAuthorRepository,
    private readonly openLibraryGateway: OpenLibraryGateway,
  ) {}

  async execute({ name }: GetAuthorRequest): Promise<Result<Author>> {
    const existingResult = await this.authorRepository.findByName(name);
    if (existingResult.isSuccess()) {
      return existingResult;
    }

    const enrichment = await this.openLibraryGateway.findAuthorEnrichment(name);
    const author = AuthorFactory.create(
      randomUUID(),
      name,
      enrichment.biography,
      enrichment.photoUrl,
    );

    return await this.authorRepository.create(author);
  }
}

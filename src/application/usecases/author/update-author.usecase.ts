import { Inject, Injectable } from '@nestjs/common';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { UpdateAuthorRequest } from 'src/application/contracts/author/update-author-request';
import { Author } from 'src/domain/entities/author.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class UpdateAuthorUseCase implements UseCase<UpdateAuthorRequest, Author> {
  constructor(@Inject('AuthorRepository') private authorRepository: IAuthorRepository) {}

  async execute({ name, biography }: UpdateAuthorRequest): Promise<Result<Author>> {
    const existingResult = await this.authorRepository.findByName(name);
    if (existingResult.isFailure()) {
      return existingResult;
    }

    const existing = existingResult.value!;
    const updated = new Author(
      existing.id,
      existing.name,
      biography !== undefined ? biography : existing.biography,
      existing.profilePictureUrl,
    );

    return await this.authorRepository.updateByName(name, updated);
  }
}

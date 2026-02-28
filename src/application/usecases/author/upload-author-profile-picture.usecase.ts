import { Inject, Injectable } from '@nestjs/common';
import { IAuthorRepository } from 'src/application/interfaces/author-repository';
import { UploadAuthorProfilePictureRequest } from 'src/application/contracts/author/upload-author-profile-picture-request';
import { Author } from 'src/domain/entities/author.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class UploadAuthorProfilePictureUseCase implements UseCase<UploadAuthorProfilePictureRequest, Author> {
  constructor(@Inject('AuthorRepository') private authorRepository: IAuthorRepository) {}

  async execute({ name, profilePictureUrl }: UploadAuthorProfilePictureRequest): Promise<Result<Author>> {
    const existingResult = await this.authorRepository.findByName(name);
    if (existingResult.isFailure()) {
      return existingResult;
    }

    const existing = existingResult.value!;
    const updated = new Author(existing.id, existing.name, existing.biography, profilePictureUrl);

    return await this.authorRepository.updateByName(name, updated);
  }
}

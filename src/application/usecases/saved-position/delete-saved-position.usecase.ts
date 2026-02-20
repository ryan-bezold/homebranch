import { Inject, Injectable } from '@nestjs/common';
import { ISavedPositionRepository } from '../../interfaces/saved-position-repository';
import { DeleteSavedPositionRequest } from '../../contracts/saved-position/delete-saved-position-request';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class DeleteSavedPositionUseCase
  implements UseCase<DeleteSavedPositionRequest, void>
{
  constructor(
    @Inject('SavedPositionRepository')
    private savedPositionRepository: ISavedPositionRepository,
  ) {}

  async execute({
    bookId,
    userId,
  }: DeleteSavedPositionRequest): Promise<Result<void>> {
    return await this.savedPositionRepository.delete(bookId, userId);
  }
}

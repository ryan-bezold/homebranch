import { Inject, Injectable } from '@nestjs/common';
import { ISavedPositionRepository } from '../../interfaces/saved-position-repository';
import { GetSavedPositionRequest } from '../../contracts/saved-position/get-saved-position-request';
import { SavedPosition } from 'src/domain/entities/saved-position.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class GetSavedPositionUseCase implements UseCase<GetSavedPositionRequest, SavedPosition> {
  constructor(
    @Inject('SavedPositionRepository')
    private savedPositionRepository: ISavedPositionRepository,
  ) {}

  async execute({ bookId, userId }: GetSavedPositionRequest): Promise<Result<SavedPosition>> {
    return await this.savedPositionRepository.findByBookAndUser(bookId, userId);
  }
}

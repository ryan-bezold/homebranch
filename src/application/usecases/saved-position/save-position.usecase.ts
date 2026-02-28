import { Inject, Injectable } from '@nestjs/common';
import { ISavedPositionRepository } from '../../interfaces/saved-position-repository';
import { SavePositionRequest } from '../../contracts/saved-position/save-position-request';
import { SavedPosition } from 'src/domain/entities/saved-position.entity';
import { SavedPositionFactory } from 'src/domain/entities/saved-position.factory';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class SavePositionUseCase implements UseCase<SavePositionRequest, SavedPosition> {
  constructor(
    @Inject('SavedPositionRepository')
    private savedPositionRepository: ISavedPositionRepository,
  ) {}

  async execute(request: SavePositionRequest): Promise<Result<SavedPosition>> {
    const savedPosition = SavedPositionFactory.create(
      request.bookId,
      request.userId,
      request.position,
      request.deviceName,
      request.percentage,
    );
    return await this.savedPositionRepository.upsert(savedPosition);
  }
}

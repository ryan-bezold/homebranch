import { Inject, Injectable } from '@nestjs/common';
import { ISavedPositionRepository } from '../../interfaces/saved-position-repository';
import { GetSavedPositionsRequest } from '../../contracts/saved-position/get-saved-positions-request';
import { SavedPosition } from 'src/domain/entities/saved-position.entity';
import { Result } from 'src/core/result';
import { UseCase } from 'src/core/usecase';

@Injectable()
export class GetSavedPositionsUseCase implements UseCase<GetSavedPositionsRequest, SavedPosition[]> {
  constructor(
    @Inject('SavedPositionRepository')
    private savedPositionRepository: ISavedPositionRepository,
  ) {}

  async execute({ userId }: GetSavedPositionsRequest): Promise<Result<SavedPosition[]>> {
    return await this.savedPositionRepository.findAllByUser(userId);
  }
}

import { Result } from 'src/core/result';
import { SavedPosition } from 'src/domain/entities/saved-position.entity';

export interface ISavedPositionRepository {
  findByBookAndUser(
    bookId: string,
    userId: string,
  ): Promise<Result<SavedPosition>>;
  findAllByUser(userId: string): Promise<Result<SavedPosition[]>>;
  upsert(savedPosition: SavedPosition): Promise<Result<SavedPosition>>;
  delete(bookId: string, userId: string): Promise<Result<void>>;
}

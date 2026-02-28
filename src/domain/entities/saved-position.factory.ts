import { SavedPosition } from 'src/domain/entities/saved-position.entity';

export class SavedPositionFactory {
  static create(
    bookId: string,
    userId: string,
    position: string,
    deviceName: string,
    percentage?: number | null,
    createdAt?: Date,
    updatedAt?: Date,
  ): SavedPosition {
    if (!bookId || !userId) {
      throw new Error('Book ID and User ID are required to create a saved position.');
    }

    const now = new Date();
    return new SavedPosition(
      bookId,
      userId,
      position,
      deviceName,
      createdAt ?? now,
      updatedAt ?? now,
      percentage ?? null,
    );
  }
}

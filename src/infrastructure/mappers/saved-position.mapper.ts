import { SavedPosition } from 'src/domain/entities/saved-position.entity';
import { SavedPositionEntity } from 'src/infrastructure/database/saved-position.entity';
import { SavedPositionFactory } from 'src/domain/entities/saved-position.factory';

export class SavedPositionMapper {
  static toDomain(entity: SavedPositionEntity): SavedPosition {
    return SavedPositionFactory.create(
      entity.bookId,
      entity.userId,
      entity.position,
      entity.deviceName,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(domain: SavedPosition): SavedPositionEntity {
    const entity = new SavedPositionEntity();
    entity.bookId = domain.bookId;
    entity.userId = domain.userId;
    entity.position = domain.position;
    entity.deviceName = domain.deviceName;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}

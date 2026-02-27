import { Author } from 'src/domain/entities/author.entity';
import { AuthorEntity } from 'src/infrastructure/database/author.entity';
import { AuthorFactory } from 'src/domain/entities/author.factory';

export class AuthorMapper {
  static toDomain(authorEntity: AuthorEntity): Author {
    return AuthorFactory.create(
      authorEntity.id,
      authorEntity.name,
      authorEntity.biography,
      authorEntity.profilePictureUrl,
    );
  }

  static toPersistence(author: Author): AuthorEntity {
    return {
      id: author.id!,
      name: author.name,
      biography: author.biography,
      profilePictureUrl: author.profilePictureUrl,
    };
  }

  static toDomainList(authorEntityList: AuthorEntity[]): Author[] {
    return authorEntityList.map((authorEntity) => this.toDomain(authorEntity));
  }
}

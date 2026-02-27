import { Author } from 'src/domain/entities/author.entity';

export class AuthorFactory {
  static create(
    id: string | null,
    name: string,
    biography: string | null = null,
    profilePictureUrl: string | null = null,
  ): Author {
    if (!name) {
      throw new Error('Name is required to create an author.');
    }

    return new Author(id, name, biography, profilePictureUrl);
  }
}

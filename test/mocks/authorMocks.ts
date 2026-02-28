import { Author } from 'src/domain/entities/author.entity';
import { AuthorEntity } from 'src/infrastructure/database/author.entity';

export const mockAuthor: Author = new Author(
  'author-uuid-1',
  'Jane Austen',
  'Jane Austen was an English novelist known for her wit and social commentary.',
  'https://covers.openlibrary.org/a/olid/OL21594A-L.jpg',
);

export const mockAuthorWithoutEnrichment: Author = new Author('author-uuid-2', 'Charles Dickens', null, null);

export const mockAuthorEntity: AuthorEntity = {
  id: mockAuthor.id!,
  name: mockAuthor.name,
  biography: mockAuthor.biography,
  profilePictureUrl: mockAuthor.profilePictureUrl,
};

export const mockAuthorEntityWithoutEnrichment: AuthorEntity = {
  id: mockAuthorWithoutEnrichment.id!,
  name: mockAuthorWithoutEnrichment.name,
  biography: null,
  profilePictureUrl: null,
};

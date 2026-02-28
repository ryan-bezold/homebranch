import { AuthorFactory } from 'src/domain/entities/author.factory';
import { Author } from 'src/domain/entities/author.entity';

describe('AuthorFactory', () => {
  describe('create', () => {
    test('Successfully creates an author with all fields', () => {
      const author = AuthorFactory.create(
        'author-uuid-1',
        'Jane Austen',
        'An English novelist.',
        'https://covers.openlibrary.org/a/olid/OL21594A-L.jpg',
      );

      expect(author).toBeInstanceOf(Author);
      expect(author.id).toBe('author-uuid-1');
      expect(author.name).toBe('Jane Austen');
      expect(author.biography).toBe('An English novelist.');
      expect(author.profilePictureUrl).toBe('https://covers.openlibrary.org/a/olid/OL21594A-L.jpg');
    });

    test('Successfully creates an author with only required fields', () => {
      const author = AuthorFactory.create('author-uuid-2', 'Charles Dickens');

      expect(author).toBeInstanceOf(Author);
      expect(author.id).toBe('author-uuid-2');
      expect(author.name).toBe('Charles Dickens');
      expect(author.biography).toBeNull();
      expect(author.profilePictureUrl).toBeNull();
    });

    test('Successfully creates an author with null id (for list results)', () => {
      const author = AuthorFactory.create(null, 'George Orwell');

      expect(author.id).toBeNull();
      expect(author.name).toBe('George Orwell');
    });

    test('Throws error when name is empty', () => {
      expect(() => AuthorFactory.create('author-uuid-3', '')).toThrow('Name is required to create an author.');
    });
  });
});

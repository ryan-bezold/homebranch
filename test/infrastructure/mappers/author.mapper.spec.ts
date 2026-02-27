import { AuthorMapper } from 'src/infrastructure/mappers/author.mapper';
import { mockAuthor, mockAuthorWithoutEnrichment, mockAuthorEntity, mockAuthorEntityWithoutEnrichment } from 'test/mocks/authorMocks';
import { Author } from 'src/domain/entities/author.entity';

describe('AuthorMapper', () => {
  describe('toDomain', () => {
    test('Converts AuthorEntity to Author domain entity', () => {
      const result = AuthorMapper.toDomain(mockAuthorEntity);

      expect(result).toBeInstanceOf(Author);
      expect(result.id).toBe(mockAuthor.id);
      expect(result.name).toBe(mockAuthor.name);
      expect(result.biography).toBe(mockAuthor.biography);
      expect(result.profilePictureUrl).toBe(mockAuthor.profilePictureUrl);
    });

    test('Handles author entity with null biography and profilePictureUrl', () => {
      const result = AuthorMapper.toDomain(mockAuthorEntityWithoutEnrichment);

      expect(result.biography).toBeNull();
      expect(result.profilePictureUrl).toBeNull();
    });
  });

  describe('toPersistence', () => {
    test('Converts Author domain entity to AuthorEntity', () => {
      const result = AuthorMapper.toPersistence(mockAuthor);

      expect(result.id).toBe(mockAuthor.id);
      expect(result.name).toBe(mockAuthor.name);
      expect(result.biography).toBe(mockAuthor.biography);
      expect(result.profilePictureUrl).toBe(mockAuthor.profilePictureUrl);
    });

    test('Creates persistence object with correct structure', () => {
      const result = AuthorMapper.toPersistence(mockAuthor);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('biography');
      expect(result).toHaveProperty('profilePictureUrl');
    });

    test('Handles author with null optional fields', () => {
      const result = AuthorMapper.toPersistence(mockAuthorWithoutEnrichment);

      expect(result.biography).toBeNull();
      expect(result.profilePictureUrl).toBeNull();
    });
  });

  describe('toDomainList', () => {
    test('Converts array of AuthorEntity to array of Author', () => {
      const entities = [mockAuthorEntity, mockAuthorEntityWithoutEnrichment];

      const result = AuthorMapper.toDomainList(entities);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Author);
      expect(result[1]).toBeInstanceOf(Author);
      expect(result[0].id).toBe(mockAuthor.id);
      expect(result[1].id).toBe(mockAuthorWithoutEnrichment.id);
    });

    test('Handles empty array', () => {
      const result = AuthorMapper.toDomainList([]);

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

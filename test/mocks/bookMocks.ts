import { Book } from 'src/domain/entities/book.entity';

export const mockBook: Book = new Book(
  'book-456',
  'Test Book',
  'Test Author',
  'test-book.epub',
  false,
  2001,
  'test-cover.jpg',
  'A test book summary.',
  'user-123',
);

export const mockBookFavorite: Book = new Book(
  'book-fav',
  'Favorite Book',
  'Famous Author',
  'favorite-book.epub',
  true,
  2023,
  'favorite-cover.jpg',
  undefined,
);

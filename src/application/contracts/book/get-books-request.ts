import { PaginatedQuery } from 'src/core/paginated-query';

export class GetBooksRequest extends PaginatedQuery {
  userId?: string;
}

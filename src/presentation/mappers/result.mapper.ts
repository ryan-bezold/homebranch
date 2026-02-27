import { Result } from 'src/core/result';

interface Response<T> {
  statusCode: number;
  body: {
    success: boolean;
    value?: T;
    error?: unknown;
    message?: string;
  };
}

export class ResultMapper {
  static toHttpResponse<T>(result: Result<T>): Response<T> {
    if (result.isSuccess()) {
      return {
        statusCode: 200,
        body: { success: true, value: result.value },
      };
    }

    const error = result.failure;

    switch (error?.code) {
      case 'NOT_FOUND':
        return {
          statusCode: 404,
          body: {
            success: false,
            error: error.code,
            message: error.message,
          },
        };
      case 'CONFLICT':
        return {
          statusCode: 409,
          body: {
            success: false,
            error: error.code,
            message: error.message,
          },
        };
      case 'BAD_REQUEST':
        return {
          statusCode: 400,
          body: {
            success: false,
            error: error.code,
            message: error.message,
          },
        };
      case 'FORBIDDEN':
        return {
          statusCode: 403,
          body: {
            success: false,
            error: error.code,
            message: error.message,
          },
        };
      default:
        return {
          statusCode: 500,
          body: {
            success: false,
            error: error?.code ?? 'INTERNAL_SERVER_ERROR',
            message: error?.message ?? 'An unexpected error occurred',
          },
        };
    }
  }
}

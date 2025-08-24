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
        body: { success: true, value: result.getValue() },
      };
    }

    const error = result.getFailure();

    switch (error.code) {
      case 'NOT_FOUND':
        return {
          statusCode: 404,
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
            error: error.code,
            message: error.message,
          },
        };
    }
  }
}

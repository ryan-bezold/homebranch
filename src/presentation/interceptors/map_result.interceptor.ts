import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { ResultMapper } from 'src/presentation/mappers/result.mapper';
import { Result } from 'src/core/result';
import { Response } from 'express';

@Injectable()
export class MapResultInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response: Response = context.switchToHttp().getResponse();
    return next.handle().pipe(
      map((result) => {
        if (result instanceof Result) {
          const httpResponse = ResultMapper.toHttpResponse(result);
          response.status(httpResponse.statusCode);
          return httpResponse.body;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return result;
      }),
    );
  }
}

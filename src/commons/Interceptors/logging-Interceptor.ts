import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    return next.handle().pipe(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tap((res) => {
        const {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          body: { ...body },
        } = request;
        if (process.env.NODE_ENV !== 'test') {
          // console.log('---->', process.env.NODE_ENV, request.url, response.statusCode);
        }
      }),
    );
    // .pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { ErrorCode } from '../enums/error-codes'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data && typeof data === 'object' && 'code' in data && 'message' in data && 'data' in data) {
          return data
        }
        return { code: ErrorCode.OK, message: 'ok', data }
      })
    )
  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { ErrorCode } from '../enums/error-codes'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const res = exception.getResponse() as any
      const message = typeof res === 'string' ? res : res?.message || 'error'
      const code = this.mapStatusToCode(status)
      response.status(status).json({ code, message, data: null })
      return
    }
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: ErrorCode.INTERNAL_ERROR,
      message: 'internal error',
      data: null
    })
  }

  private mapStatusToCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT
      default:
        return ErrorCode.INTERNAL_ERROR
    }
  }
}

import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'

@Injectable()
export class AdminTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const token = String(process.env.ADMIN_TOKEN || '').trim()
    if (!token) {
      throw new ForbiddenException('admin token not configured')
    }

    const req = context.switchToHttp().getRequest<any>()
    const provided = String(req?.headers?.['x-admin-token'] || '').trim()
    if (!provided || provided !== token) {
      throw new ForbiddenException('forbidden')
    }
    return true
  }
}

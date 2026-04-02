import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const auth = req.headers['authorization'] || ''
    const token = String(auth).replace(/^Bearer\s+/i, '')
    if (!token) {
      throw new UnauthorizedException('missing token')
    }
    try {
      const payload = await this.authService.verifyToken(token)
      req.user = { id: payload.sub }
      return true
    } catch {
      throw new UnauthorizedException('invalid token')
    }
  }
}

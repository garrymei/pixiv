import { Body, Controller, Get, Headers, Post, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { mockId?: string; nickname?: string }) {
    return this.authService.mockLogin(body || {})
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Headers('authorization') auth: string) {
    const token = (auth || '').replace(/^Bearer\s+/i, '')
    const payload = await this.authService.verifyToken(token)
    return { id: payload.sub }
  }
}

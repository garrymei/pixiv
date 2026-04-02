import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common'
import { EventRegistrationService } from './event-registration.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('events')
export class EventRegistrationController {
  constructor(private readonly registrationService: EventRegistrationService) {}

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  async register(@Req() req: any, @Param('id') id: string) {
    return this.registrationService.register(Number(id), req.user.id)
  }

  @Get(':id/register/status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: any, @Param('id') id: string) {
    return this.registrationService.status(Number(id), req.user.id)
  }
}

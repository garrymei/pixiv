import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async summary(@Req() req: any) {
    return this.profileService.summary(req.user.id)
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard)
  async myBookings(@Req() req: any) {
    return this.profileService.myBookings(req.user.id)
  }
}

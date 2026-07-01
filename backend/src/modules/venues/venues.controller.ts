import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { AdminTokenGuard } from '../../common/guards/admin-token.guard'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { VenuesService } from './venues.service'

@Controller()
export class VenuesController {
  constructor(private readonly venuesService: VenuesService) {}

  @Get('venues')
  async list() {
    return this.venuesService.list()
  }

  @Get('venues/:id')
  async getById(@Param('id') id: string) {
    return this.venuesService.getById(Number(id))
  }

  @Get('venues/scenes/:id/availability')
  async getSceneAvailability(@Param('id') id: string) {
    return this.venuesService.getSceneAvailability(Number(id))
  }

  @Post('venues/bookings')
  @UseGuards(JwtAuthGuard)
  async createBooking(@Req() req: any, @Body() body: { scene_id?: number; start_time?: number; end_time?: number; note?: string }) {
    return this.venuesService.createBooking(req.user.id, body || {})
  }

  @Patch('venues/bookings/:id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(@Req() req: any, @Param('id') id: string) {
    return this.venuesService.cancelBooking(req.user.id, Number(id))
  }

  @Get('admin/venues')
  @UseGuards(AdminTokenGuard)
  async listForAdmin() {
    return this.venuesService.listForAdmin()
  }

  @Post('admin/venues')
  @UseGuards(AdminTokenGuard)
  async createVenue(@Body() body: any) {
    return this.venuesService.createVenue(body || {})
  }

  @Patch('admin/venues/:id')
  @UseGuards(AdminTokenGuard)
  async updateVenue(@Param('id') id: string, @Body() body: any) {
    return this.venuesService.updateVenue(Number(id), body || {})
  }

  @Post('admin/venue-scenes')
  @UseGuards(AdminTokenGuard)
  async createScene(@Body() body: any) {
    return this.venuesService.createScene(body || {})
  }

  @Patch('admin/venue-scenes/:id')
  @UseGuards(AdminTokenGuard)
  async updateScene(@Param('id') id: string, @Body() body: any) {
    return this.venuesService.updateScene(Number(id), body || {})
  }
}

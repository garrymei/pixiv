import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { EventsService } from './events.service'
import { ListEventsDto } from './dto/list-events.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { EventRegistrationService } from '../event-registration/event-registration.service'
import { UpsertEventDto } from './dto/upsert-event.dto'

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly registrationService: EventRegistrationService
  ) {}

  @Get()
  async list(@Query() query: ListEventsDto) {
    return this.eventsService.list({ type: query.type, page: query.page, pageSize: query.pageSize })
  }

  @Get('me/registrations')
  @UseGuards(JwtAuthGuard)
  async myRegistrations(@Req() req: any) {
    return this.registrationService.listByUser(req.user.id)
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.eventsService.getById(Number(id))
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: UpsertEventDto) {
    return this.eventsService.create(dto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: Partial<UpsertEventDto>) {
    return this.eventsService.update(Number(id), dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.eventsService.remove(Number(id))
  }
}

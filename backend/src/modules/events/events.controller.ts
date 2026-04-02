import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common'
import { EventsService } from './events.service'
import { ListEventsDto } from './dto/list-events.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { EventRegistrationService } from '../event-registration/event-registration.service'

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
}

import { Body, Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common'
import { DemandApplicationService } from './demand-application.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('demands')
export class DemandApplicationController {
  constructor(private readonly demandApplicationService: DemandApplicationService) {}

  @Get('me/applied')
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: any) {
    return this.demandApplicationService.listByUser(req.user.id)
  }

  @Post(':id/apply')
  @UseGuards(JwtAuthGuard)
  async apply(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.apply(Number(id), req.user.id)
  }

  @Get(':id/apply/status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.status(Number(id), req.user.id)
  }

  @Post(':id/apply/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { application_id?: number }
  ) {
    return this.demandApplicationService.confirm(Number(id), req.user.id, body?.application_id)
  }

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  async listByDemand(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.listByDemand(Number(id), req.user.id)
  }

  @Post(':id/agreement/cancel/request')
  @UseGuards(JwtAuthGuard)
  async requestCancelAgreement(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.requestCancelAgreement(Number(id), req.user.id)
  }

  @Post(':id/agreement/cancel/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmCancelAgreement(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.confirmCancelAgreement(Number(id), req.user.id)
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard)
  async completeDemand(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.completeDemand(Number(id), req.user.id)
  }

  @Post(':id/recruit/continue')
  @UseGuards(JwtAuthGuard)
  async continueRecruit(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.continueRecruit(Number(id), req.user.id)
  }

  @Post(':id/apply/exit/request')
  @UseGuards(JwtAuthGuard)
  async requestExit(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.requestExit(Number(id), req.user.id)
  }

  @Post(':id/apply/exit/approve')
  @UseGuards(JwtAuthGuard)
  async approveExit(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { application_id?: number }
  ) {
    return this.demandApplicationService.approveExit(Number(id), req.user.id, Number(body?.application_id || 0))
  }

  @Post(':id/time-change/request')
  @UseGuards(JwtAuthGuard)
  async requestTimeChange(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { event_time?: number }
  ) {
    return this.demandApplicationService.requestTimeChange(Number(id), req.user.id, Number(body?.event_time || 0))
  }

  @Post(':id/time-change/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmTimeChange(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.confirmTimeChange(Number(id), req.user.id)
  }

  @Post(':id/participant-limit')
  @UseGuards(JwtAuthGuard)
  async updateParticipantLimit(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { participant_limit?: number }
  ) {
    return this.demandApplicationService.updateParticipantLimit(Number(id), req.user.id, Number(body?.participant_limit || 0))
  }

  @Post(':id/cancel/request')
  @UseGuards(JwtAuthGuard)
  async requestCancelDemand(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.requestCancelDemand(Number(id), req.user.id)
  }

  @Post(':id/cancel/confirm')
  @UseGuards(JwtAuthGuard)
  async confirmCancelDemand(@Req() req: any, @Param('id') id: string) {
    return this.demandApplicationService.confirmCancelDemand(Number(id), req.user.id)
  }
}

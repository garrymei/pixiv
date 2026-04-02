import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common'
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
}

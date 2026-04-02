import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common'
import { DemandsService } from './demands.service'
import { ListDemandsDto } from './dto/list-demands.dto'
import { CreateDemandDto } from './dto/create-demand.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('demands')
export class DemandsController {
  constructor(private readonly demandsService: DemandsService) {}

  @Get()
  async list(@Query() query: ListDemandsDto) {
    return this.demandsService.list({ demand_type: query.demand_type, page: query.page, pageSize: query.pageSize })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.demandsService.listMine(req.user.id, page || 1, pageSize || 10)
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.demandsService.getById(Number(id))
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreateDemandDto) {
    return this.demandsService.create(req.user.id, dto)
  }
}

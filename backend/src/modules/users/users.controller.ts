import { Body, Controller, Get, Param, Patch, UseGuards, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UpdateUserDto } from './dto/update-user.dto'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    const user = await this.usersService.getCurrentUser(req.user.id)
    return user
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: any, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateCurrentUser(req.user.id, dto)
    return user
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(Number(id))
    return user
  }
}

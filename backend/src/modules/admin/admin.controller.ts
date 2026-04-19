import { Body, Controller, Get, NotFoundException, Param, Patch, Res, UseGuards } from '@nestjs/common'
import { join } from 'path'
import type { Response } from 'express'
import { PostsService } from '../posts/posts.service'
import { DemandsService } from '../demands/demands.service'
import { UsersService } from '../users/users.service'
import { AdminTokenGuard } from '../../common/guards/admin-token.guard'

@Controller('admin')
export class AdminController {
  constructor(
    private readonly postsService: PostsService,
    private readonly demandsService: DemandsService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  renderIndex(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'admin', 'index.html'))
  }

  @Patch('reviews/posts/:id')
  @UseGuards(AdminTokenGuard)
  async reviewPost(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string }
  ) {
    const data = await this.postsService.review(Number(id), body?.action, body?.reason)
    if (!data) throw new NotFoundException('post not found')
    return data
  }

  @Patch('reviews/demands/:id')
  @UseGuards(AdminTokenGuard)
  async reviewDemand(
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string }
  ) {
    const data = await this.demandsService.review(Number(id), body?.action, body?.reason)
    if (!data) throw new NotFoundException('demand not found')
    return data
  }

  @Patch('reviews/avatars/:userId')
  @UseGuards(AdminTokenGuard)
  async reviewAvatar(
    @Param('userId') userId: string,
    @Body() body: { action: 'approve' | 'reject'; reason?: string }
  ) {
    const data = await this.usersService.reviewAvatar(Number(userId), body?.action, body?.reason)
    if (!data) throw new NotFoundException('user not found')
    return data
  }
}

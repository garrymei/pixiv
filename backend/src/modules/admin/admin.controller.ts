import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Res, UseGuards } from '@nestjs/common'
import { join } from 'path'
import type { Response } from 'express'
import { PostsService } from '../posts/posts.service'
import { DemandsService } from '../demands/demands.service'
import { UsersService } from '../users/users.service'
import { BannersService } from '../banners/banners.service'
import { AdminTokenGuard } from '../../common/guards/admin-token.guard'
import { DemandStatus, ModerationStatus } from '../../types/enums'

@Controller('admin')
export class AdminController {
  constructor(
    private readonly postsService: PostsService,
    private readonly demandsService: DemandsService,
    private readonly usersService: UsersService,
    private readonly bannersService: BannersService
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

  @Get('reviews/posts')
  @UseGuards(AdminTokenGuard)
  async listPostReviews(@Query('status') status?: ModerationStatus) {
    return this.postsService.listForAdmin({ status, pageSize: 100 })
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

  @Get('reviews/demands')
  @UseGuards(AdminTokenGuard)
  async listDemandReviews(
    @Query('status') status?: DemandStatus,
    @Query('moderation_status') moderationStatus?: ModerationStatus
  ) {
    return this.demandsService.listForAdmin({ status, moderationStatus, pageSize: 100 })
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

  @Get('reviews/avatars')
  @UseGuards(AdminTokenGuard)
  async listAvatarReviews(@Query('status') status?: ModerationStatus) {
    return this.usersService.listAvatarReviews(status)
  }

  @Get('banners')
  @UseGuards(AdminTokenGuard)
  async listBanners(@Query('position') position?: string) {
    return this.bannersService.listForAdmin(position)
  }

  @Post('banners')
  @UseGuards(AdminTokenGuard)
  async createBanner(
    @Body() body: { title?: string; image_url?: string; jump_link?: string; position?: string; sort_order?: number; status?: number }
  ) {
    return this.bannersService.create({
      title: body?.title,
      imageUrl: body?.image_url,
      jumpLink: body?.jump_link,
      position: body?.position,
      sortOrder: body?.sort_order,
      status: body?.status
    })
  }

  @Patch('banners/:id')
  @UseGuards(AdminTokenGuard)
  async updateBanner(
    @Param('id') id: string,
    @Body() body: { title?: string; image_url?: string; jump_link?: string; position?: string; sort_order?: number; status?: number }
  ) {
    return this.bannersService.update(Number(id), {
      title: body?.title,
      imageUrl: body?.image_url,
      jumpLink: body?.jump_link,
      position: body?.position,
      sortOrder: body?.sort_order,
      status: body?.status
    })
  }
}

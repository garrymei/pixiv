import { Controller, Delete, Get, Param, Post, UseGuards, Req } from '@nestjs/common'
import { LikesService } from './likes.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('likes/posts')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  async like(@Req() req: any, @Param('postId') postId: string) {
    return this.likesService.like(Number(postId), req.user.id)
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async unlike(@Req() req: any, @Param('postId') postId: string) {
    return this.likesService.unlike(Number(postId), req.user.id)
  }

  @Get(':postId/status')
  @UseGuards(JwtAuthGuard)
  async status(@Req() req: any, @Param('postId') postId: string) {
    return this.likesService.status(Number(postId), req.user.id)
  }
}

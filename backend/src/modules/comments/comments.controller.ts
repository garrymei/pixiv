import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CreateCommentDto } from './dto/create-comment.dto'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  async list(@Query('post_id') postId: number) {
    const list = await this.commentsService.listByPost(Number(postId))
    return {
      list,
      total: list.length
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(req.user.id, dto)
  }
}

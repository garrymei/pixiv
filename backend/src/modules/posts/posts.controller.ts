import { Body, Controller, Get, Param, Post, Query, UseGuards, Req } from '@nestjs/common'
import { PostsService } from './posts.service'
import { ListPostsDto } from './dto/list-posts.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async list(@Query() query: ListPostsDto) {
    return this.postsService.list({ type: query.type, page: query.page, pageSize: query.pageSize })
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async listMine(@Req() req: any, @Query('page') page?: number, @Query('pageSize') pageSize?: number) {
    return this.postsService.listMine(req.user.id, page || 1, pageSize || 10)
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.postsService.getById(Number(id))
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.user.id, dto)
  }
}

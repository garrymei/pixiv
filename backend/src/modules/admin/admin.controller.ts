import { Controller, Get, Res } from '@nestjs/common'
import { join } from 'path'
import type { Response } from 'express'

@Controller('admin')
export class AdminController {
  @Get()
  renderIndex(@Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'public', 'admin', 'index.html'))
  }
}

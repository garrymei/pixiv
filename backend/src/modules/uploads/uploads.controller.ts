import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UploadsService } from './uploads.service'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { Express } from 'express'

function storageFactory() {
  const dir = join(process.cwd(), 'uploads')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return diskStorage({
    destination: dir,
    filename: (_req: any, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
      const ext = extname(file.originalname || '')
      const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext
      cb(null, name)
    }
  })
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: storageFactory() }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.getUrl(file)
  }
}

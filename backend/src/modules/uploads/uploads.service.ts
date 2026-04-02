import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Express } from 'express'

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}
  async getUrl(file: Express.Multer.File) {
    if (!file?.filename) {
      throw new BadRequestException('file required')
    }
    const base = this.config.get<string>('UPLOAD_BASE_URL')
    const url = base ? `${base.replace(/\/$/, '')}/uploads/${file.filename}` : `/uploads/${file.filename}`
    return { url }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { openSync, readSync, closeSync, unlinkSync } from 'fs'
import { extname } from 'path'
import type { Express } from 'express'

function detectImageType(header: Buffer) {
  if (header.length < 12) return ''
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return 'png'
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return 'jpg'
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return 'gif'
  if (header.toString('ascii', 0, 4) === 'RIFF' && header.toString('ascii', 8, 12) === 'WEBP') return 'webp'
  return ''
}

function isAllowedExt(ext: string) {
  const next = ext.toLowerCase()
  return next === '.png' || next === '.jpg' || next === '.jpeg' || next === '.gif' || next === '.webp'
}

@Injectable()
export class UploadsService {
  constructor(private readonly config: ConfigService) {}
  async getUrl(file: Express.Multer.File) {
    if (!file?.filename || !file?.path) {
      throw new BadRequestException('file required')
    }

    const ext = extname(file.filename || '')
    if (!isAllowedExt(ext)) {
      try { unlinkSync(file.path) } catch {}
      throw new BadRequestException('invalid file type')
    }

    let header: Buffer
    try {
      const fd = openSync(file.path, 'r')
      try {
        header = Buffer.alloc(12)
        readSync(fd, header, 0, 12, 0)
      } finally {
        closeSync(fd)
      }
    } catch {
      try { unlinkSync(file.path) } catch {}
      throw new BadRequestException('invalid file')
    }

    const detected = detectImageType(header)
    if (!detected) {
      try { unlinkSync(file.path) } catch {}
      throw new BadRequestException('invalid image')
    }

    const base = this.config.get<string>('UPLOAD_BASE_URL')
    const url = base ? `${base.replace(/\/$/, '')}/uploads/${file.filename}` : `/uploads/${file.filename}`
    return { url }
  }
}

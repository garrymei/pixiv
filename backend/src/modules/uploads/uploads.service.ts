import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { openSync, readSync, closeSync, unlinkSync, renameSync } from 'fs'
import { extname } from 'path'
import type { Express } from 'express'
import sharp from 'sharp'

const MAX_IMAGE_DIMENSION = 1600
const JPEG_QUALITY = 82
const WEBP_QUALITY = 82

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

async function replaceWithOptimizedImage(filePath: string, detectedType: string) {
  if (detectedType === 'gif') return

  const tmpPath = `${filePath}.optimized`
  try {
    let pipeline = sharp(filePath, { failOn: 'none' })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true
      })

    if (detectedType === 'png') {
      pipeline = pipeline.png({ compressionLevel: 9, palette: true })
    } else if (detectedType === 'webp') {
      pipeline = pipeline.webp({ quality: WEBP_QUALITY })
    } else {
      pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    }

    await pipeline.toFile(tmpPath)
    await sharp(tmpPath).metadata()
    renameSync(tmpPath, filePath)
  } catch {
    try { unlinkSync(tmpPath) } catch {}
  }
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

    await replaceWithOptimizedImage(file.path, detected)

    const configuredBase = this.config.get<string>('UPLOAD_BASE_URL')?.trim()
    const base = configuredBase && !configuredBase.includes('your-upload-base-url') ? configuredBase : ''
    const url = base ? `${base.replace(/\/$/, '')}/uploads/${file.filename}` : `/uploads/${file.filename}`
    return { url }
  }
}

import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UploadsService } from './uploads.service'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import type { Express } from 'express'

const ALLOWED_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp'])
const uploadBuckets = new Map<number, { windowStart: number; count: number }>()

function getUploadMaxBytes() {
  const configured = Number(process.env.UPLOAD_MAX_BYTES || '')
  if (Number.isFinite(configured) && configured > 0) return Math.trunc(configured)
  return 5 * 1024 * 1024
}

function getUploadLimitConfig() {
  const maxUploads = Number(process.env.UPLOAD_RATE_LIMIT_MAX || '')
  const windowMs = Number(process.env.UPLOAD_RATE_LIMIT_WINDOW_MS || '')
  return {
    max: Number.isFinite(maxUploads) && maxUploads > 0 ? Math.trunc(maxUploads) : 20,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? Math.trunc(windowMs) : 60_000
  }
}

function checkAndConsumeUploadRate(userId: number) {
  const { max, windowMs } = getUploadLimitConfig()
  const now = Date.now()
  const prev = uploadBuckets.get(userId)
  if (!prev || now - prev.windowStart >= windowMs) {
    uploadBuckets.set(userId, { windowStart: now, count: 1 })
    return true
  }
  if (prev.count >= max) return false
  prev.count += 1
  uploadBuckets.set(userId, prev)
  return true
}

function storageFactory() {
  const dir = join(process.cwd(), 'uploads')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return diskStorage({
    destination: dir,
    filename: (_req: any, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
      const ext = extname(file.originalname || '').toLowerCase()
      const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext
      cb(null, name)
    }
  })
}

function imageFileFilter(req: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) {
  const userId = Number(req?.user?.id || 0)
  if (!Number.isFinite(userId) || userId <= 0) {
    cb(new Error('unauthorized'), false)
    return
  }

  if (!checkAndConsumeUploadRate(userId)) {
    cb(new Error('upload rate limited'), false)
    return
  }

  const ext = extname(file.originalname || '').toLowerCase()
  if (!ALLOWED_IMAGE_EXTS.has(ext)) {
    cb(new Error('invalid file type'), false)
    return
  }

  const mime = String(file.mimetype || '').toLowerCase()
  if (!mime.startsWith('image/')) {
    cb(new Error('invalid file type'), false)
    return
  }

  cb(null, true)
}

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: storageFactory(),
    limits: {
      fileSize: getUploadMaxBytes(),
      files: 1
    },
    fileFilter: imageFileFilter
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.getUrl(file)
  }
}

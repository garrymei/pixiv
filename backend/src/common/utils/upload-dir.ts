import { isAbsolute, join, normalize } from 'path'

export function getUploadDir() {
  const configured = String(process.env.UPLOAD_DIR || '').trim()
  if (!configured) return join(process.cwd(), 'uploads')
  return normalize(isAbsolute(configured) ? configured : join(process.cwd(), configured))
}

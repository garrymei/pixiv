function toTimestamp(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return undefined
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime()
  return timestamp && !Number.isNaN(timestamp) ? timestamp : undefined
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateTime(value?: number | string | null, fallback = '') {
  const timestamp = toTimestamp(value)
  if (!timestamp) return fallback

  const date = new Date(timestamp)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function getTimestamp(value?: number | string | null) {
  return toTimestamp(value)
}

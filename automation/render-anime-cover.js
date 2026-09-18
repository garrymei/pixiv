#!/usr/bin/env node

const sharp = require('../backend/node_modules/sharp')

const [input, output, eyebrow, titleLine1, titleLine2, meta] = process.argv.slice(2)
if (![input, output, eyebrow, titleLine1, titleLine2, meta].every(Boolean)) {
  console.error('usage: render-anime-cover <input> <output> <eyebrow> <title1> <title2> <meta>')
  process.exit(2)
}

const escapeXml = value => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const overlay = Buffer.from(`
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#080b20" stop-opacity="0.92"/>
      <stop offset="0.48" stop-color="#080b20" stop-opacity="0.64"/>
      <stop offset="0.78" stop-color="#080b20" stop-opacity="0.08"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-opacity="0.65"/></filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#shade)"/>
  <rect x="64" y="72" width="286" height="52" rx="26" fill="#f43f7f" fill-opacity="0.96"/>
  <text x="207" y="108" text-anchor="middle" font-family="Noto Sans CJK SC" font-size="25" font-weight="700" fill="#fff">${escapeXml(eyebrow)}</text>
  <g filter="url(#shadow)" font-family="Noto Sans CJK SC" font-weight="900" fill="#fff">
    <text x="64" y="720" font-size="66">${escapeXml(titleLine1)}</text>
    <text x="64" y="802" font-size="66">${escapeXml(titleLine2)}</text>
  </g>
  <rect x="64" y="850" width="470" height="4" rx="2" fill="#59e3ff"/>
  <text x="64" y="910" font-family="Noto Sans CJK SC" font-size="31" font-weight="700" fill="#dce9ff">${escapeXml(meta)}</text>
  <text x="64" y="960" font-family="Noto Sans CJK SC" font-size="21" font-weight="700" letter-spacing="3" fill="#9fb6d9">就酱次元区 · 广东二次元资讯</text>
</svg>`)

sharp(input)
  .resize(1024, 1024, { fit: 'cover', position: 'centre' })
  .composite([{ input: overlay }])
  .png({ compressionLevel: 9 })
  .toFile(output)
  .then(() => console.log(output))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

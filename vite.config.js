import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Serve the `uploads/` folder as raw static files so Vite does not try to
// compile the HLS `.ts` (MPEG transport stream) segments as TypeScript.
function serveUploads() {
  const mimeTypes = {
    '.m3u8': 'application/vnd.apple.mpegurl',
    '.ts': 'video/mp2t',
  }
  return {
    name: 'serve-uploads',
    configureServer(server) {
      server.middlewares.use('/uploads', (req, res, next) => {
        const urlPath = decodeURIComponent(req.url.split('?')[0])
        const filePath = path.join(process.cwd(), 'uploads', urlPath)

        if (!filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
          res.statusCode = 403
          return res.end('Forbidden')
        }

        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) return next()

          const ext = path.extname(filePath)
          if (mimeTypes[ext]) res.setHeader('Content-Type', mimeTypes[ext])
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Accept-Ranges', 'bytes')

          const total = stats.size
          const range = req.headers.range

          // Support HTTP Range requests so the HLS player can fetch segments
          // smoothly (avoids stutter at higher playback speeds).
          if (range) {
            const match = /bytes=(\d*)-(\d*)/.exec(range)
            const start = match && match[1] ? parseInt(match[1], 10) : 0
            const end = match && match[2] ? parseInt(match[2], 10) : total - 1

            if (start >= total || end >= total) {
              res.statusCode = 416
              res.setHeader('Content-Range', `bytes */${total}`)
              return res.end()
            }

            res.statusCode = 206
            res.setHeader('Content-Range', `bytes ${start}-${end}/${total}`)
            res.setHeader('Content-Length', end - start + 1)
            return fs.createReadStream(filePath, { start, end }).pipe(res)
          }

          res.setHeader('Content-Length', total)
          fs.createReadStream(filePath).pipe(res)
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveUploads()],
})

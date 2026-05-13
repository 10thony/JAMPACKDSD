import fs from 'node:fs'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { ENGINEERING_REPORT_SHARE_TOKEN } from './src/lib/engineering-report-share-token'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const reportFilename = 'JustinMartinez2026EngineeringReport.html'

export function leadershipReportStaticRoute(): Plugin {
  const reportAbs = path.resolve(__dirname, reportFilename)
  const urlPaths = new Set([
    `/leadership-summary/${ENGINEERING_REPORT_SHARE_TOKEN}`,
    `/leadership-summary/${ENGINEERING_REPORT_SHARE_TOKEN}/`,
  ])

  const serveReport = (
    req: IncomingMessage,
    res: ServerResponse,
    next: (err?: unknown) => void,
  ) => {
    const pathname = req.url?.split('?')[0] ?? ''
    if (!urlPaths.has(pathname)) {
      next()
      return
    }
    try {
      const html = fs.readFileSync(reportAbs, 'utf-8')
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(html)
    } catch {
      next()
    }
  }

  return {
    name: 'leadership-report-static-html',
    enforce: 'pre',
    configureServer(server) {
      server.middlewares.use(serveReport)
    },
    configurePreviewServer(server) {
      server.middlewares.use(serveReport)
    },
    writeBundle(options) {
      const outDir = options.dir
      if (!outDir) return
      const dest = path.join(
        outDir,
        'leadership-summary',
        ENGINEERING_REPORT_SHARE_TOKEN,
        'index.html',
      )
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(reportAbs, dest)
    },
  }
}

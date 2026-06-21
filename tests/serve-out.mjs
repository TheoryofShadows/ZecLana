// Minimal static file server for the Next static export (`out/`), used by the
// Playwright webServer. No external dependency. Honors trailingSlash output by
// resolving directories to index.html.
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import { join, extname, normalize } from "node:path"

const root = new URL("../out/", import.meta.url).pathname
const port = Number(process.env.PORT || 3210)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
}

async function tryFiles(pathname) {
  const clean = normalize(pathname).replace(/^(\.\.[/\\])+/, "")
  const candidates = [clean]
  if (clean.endsWith("/")) candidates.push(join(clean, "index.html"))
  else candidates.push(clean + "/index.html", clean + ".html")
  for (const c of candidates) {
    try {
      const file = join(root, c)
      const data = await readFile(file)
      return { data, type: TYPES[extname(file)] || "application/octet-stream" }
    } catch {
      /* try next */
    }
  }
  return null
}

createServer(async (req, res) => {
  const pathname = decodeURIComponent((req.url || "/").split("?")[0])
  const hit = (await tryFiles(pathname)) || (await tryFiles("/404.html"))
  if (!hit) {
    res.writeHead(404).end("Not found")
    return
  }
  res.writeHead(pathname.endsWith(".html") || hit.type.startsWith("text/html") ? 200 : 200, { "Content-Type": hit.type })
  res.end(hit.data)
}).listen(port, () => console.log(`serving out/ on http://localhost:${port}`))

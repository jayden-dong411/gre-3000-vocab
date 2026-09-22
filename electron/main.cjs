const { app, BrowserWindow, shell } = require("electron")
const fs = require("fs")
const http = require("http")
const path = require("path")

const distRoot = path.join(__dirname, "..", "dist")

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
}

function fileFor(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0])
  const rel = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "")
  const file = path.resolve(distRoot, rel)
  if (file !== distRoot && !file.startsWith(distRoot + path.sep)) return null
  return file
}

function send(res, file) {
  const body = fs.readFileSync(file)
  res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" })
  res.end(body)
}

function startServer() {
  const server = http.createServer((req, res) => {
    const file = fileFor(req.url || "/")
    if (!file) {
      res.writeHead(403)
      res.end()
      return
    }
    if (fs.existsSync(file) && fs.statSync(file).isFile()) {
      send(res, file)
      return
    }
    if (path.extname(file)) {
      res.writeHead(404)
      res.end()
      return
    }
    send(res, path.join(distRoot, "index.html"))
  })
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address()
      resolve(typeof address === "object" && address ? address.port : 0)
    })
  })
}

async function createWindow() {
  const port = await startServer()
  const iconPath = path.join(__dirname, "..", "build", "icon.png")
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: "GRE 镇考 3000",
    backgroundColor: "#eef2f7",
    autoHideMenuBar: true,
    show: false,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
  })
  win.once("ready-to-show", () => win.show())
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
  await win.loadURL(`http://127.0.0.1:${port}/`)
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  app.on("second-instance", () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })
  app.whenReady().then(createWindow)
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
  })
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}

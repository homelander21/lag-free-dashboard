const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1380,
    height: 860,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: "#070A12",
    title: "LagZero – Smart Gaming Network Stabilizer",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs")
    }
  });

  // In production, load the built files.
  // For local dev, use Vite dev server by editing this to your localhost URL.
  const indexPath = path.join(__dirname, "..", "dist", "index.html");
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});


import * as fs from "node:fs";
import {join} from 'path'
import {app, BrowserWindow, ipcMain, shell, crashReporter} from 'electron'
import * as path from "node:path";
import * as mm from "music-metadata";

process.env.DIST = join(__dirname, '../dist')
process.env.PUBLIC = app.isPackaged ? process.env.DIST : join(process.env.DIST, '../public')

let win: BrowserWindow | null
// Here, you can also use other preload
const preload = join(__dirname, './preload.js')
const url = process.env.VITE_DEV_SERVER_URL

function createWindow() {
  win = new BrowserWindow({
    icon: join(process.env.PUBLIC, 'logo.svg'),
    title: 'Test',
    webPreferences: {
      preload,
    },
  })

  // Open links in the browser, not inside the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (url) {
    win.loadURL(url)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(process.env.DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
ipcMain.handle('test-invoke', (event, args) => {


  return fs.readdirSync('D:\\nicotine\\downloads')
      .filter((file: any) => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.flac' || ext === '.mp3' || ext === '.wav';
      })
      .map((file: any) => path.join('D:\\nicotine\\downloads', file));
})
ipcMain.handle('get-audio-stream', async (_event, filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) reject(err);
      else resolve(data.buffer);
    });
  });
})
ipcMain.handle('get-music-metadata', async (_event, filePath) => {
  try {
    const metadata = await mm.parseFile(filePath);
    return {
      title: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      duration: metadata.format.duration,
      bitrate: metadata.format.bitrate,
      sampleRate: metadata.format.sampleRate,
      format: metadata.format.container
    };
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return null;
  }
})
crashReporter.start({ uploadToServer: false });

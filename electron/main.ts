import * as fs from "node:fs";
import {join} from 'path'
import {app, BrowserWindow, crashReporter, ipcMain, shell} from 'electron'
import * as path from "node:path";
import {register} from "../src/protocol";
import {Depot} from "../src/depot";
const { loadMusicMetadata } = require('music-metadata');
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

const depot = new Depot();

register(depot);

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.handle('depot-get', () => {
    return depot;
});

ipcMain.handle('depot-add', (_, { data, type }) => {
    return depot.depotAdd(data, type);
});

ipcMain.handle('depot-get-uuid', (_, path) => {
    return depot.getDepotUUID(path);
});

ipcMain.handle('depot-get-path', (_, uuid) => {
    return depot.getDepotPath(uuid);
});

ipcMain.handle('test-invoke', (event, args) => {
  return fs.readdirSync('D:\\nicotine\\downloads')
      .filter((file: any) => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.flac' || ext === '.mp3' || ext === '.wav';
      })
      .map((file: any) => path.join('D:\\nicotine\\downloads', file));
})
ipcMain.handle('get-audio-stream', async (_event, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;
    const stream = fs.createReadStream(filePath);
    const chunks: Buffer[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
      // Send chunk to renderer
      _event.sender.send('audio-chunk', {
        chunk: chunk,
        isLastChunk: chunks.length * chunk.length >= fileSize
      });
    }
    
    return { fileSize };
  } catch (error) {
    console.error('Error streaming audio:', error);
    throw error;
  }
})

ipcMain.handle('get-music-metadata', async (_event, filePath) => {
  try {
    // Dynamically loads the ESM module in a CommonJS project
    const mm = await loadMusicMetadata();

    return await mm.parseFile(filePath);
  } catch (error) {
    console.error('Error parsing metadata:', error);
    return null;
  }
})

import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path.join(__dirname, 'public', 'index.html'));
    }
};
app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
ipcMain.handle('test-invoke', (event, args) => {
    const musicFiles = fs.readdirSync('D:\\nicotine\\downloads')
        .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ext === '.flac' || ext === '.mp3' || ext === '.wav';
    })
        .map((file) => path.join('D:\\nicotine\\downloads', file));
    return musicFiles;
    console.log(args);
    return ["asd", "asd2"];
});
ipcMain.handle('play-music', (event, args) => {
    console.log(args);
});
//# sourceMappingURL=main.js.map
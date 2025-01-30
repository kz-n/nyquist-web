import { contextBridge, ipcRenderer } from 'electron';
contextBridge.exposeInMainWorld('api', {
    getMusic: (args) => ipcRenderer.invoke('test-invoke', args),
    playMusic: (args) => ipcRenderer.invoke('play-music', args)
});
//# sourceMappingURL=preload.js.map
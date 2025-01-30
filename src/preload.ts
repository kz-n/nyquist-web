import { contextBridge, ipcRenderer } from 'electron'


contextBridge.exposeInMainWorld('api', {
    getMusic: (args: string) => ipcRenderer.invoke('test-invoke', args),
    playMusic: (args: string) => ipcRenderer.invoke('play-music', args)
});

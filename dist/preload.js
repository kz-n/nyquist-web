'use strict';

var electron = require('electron');

electron.contextBridge.exposeInMainWorld('api', {
    getMusic: (args) => electron.ipcRenderer.invoke('test-invoke', args),
    playMusic: (args) => electron.ipcRenderer.invoke('play-music', args)
});
//# sourceMappingURL=preload.js.map

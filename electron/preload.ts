/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 * 
 * https://www.electronjs.org/docs/latest/tutorial/tutorial-preload
 */
import { contextBridge, ipcRenderer } from 'electron'
import {Depot} from "../src/depot";
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = ev => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)
contextBridge.exposeInMainWorld('api', {
  getMusic: (args: string) => ipcRenderer.invoke('test-invoke', args),
  getAudioStream: (filePath: string) => ipcRenderer.invoke('get-audio-stream', filePath) as Promise<ArrayBuffer>,
  getMusicMetadata: (filePath: string) => ipcRenderer.invoke('get-music-metadata', filePath),
  getDepot: () => ipcRenderer.invoke('depot-get'),
  depotAdd: (data: string | { data: number[], format: string }, type: 'path' | 'blob' = 'path') => 
    ipcRenderer.invoke('depot-add', { data, type }),
  getDepotUUID: (args: string) => ipcRenderer.invoke('depot-get-uuid', args),
  getDepotPath: (args: string) => ipcRenderer.invoke('depot-get-path', args),
});

// Add type declarations
declare global {
  interface Window {
    api: {
      getMusic: (args: string) => Promise<string[]>;
      getAudioStream: (filePath: string) => Promise<ArrayBuffer>;
      getMusicMetadata: (filePath: string) => Promise<{
        common?: {
          picture?: Array<{
            data: Uint8Array;
            format: string;
          }>;
        };
      } | null>;
      getDepot: () => Promise<Depot>;
      depotAdd: (data: string | { data: number[], format: string }, type?: 'path' | 'blob') => Promise<string>;
      getDepotUUID: (args: string) => Promise<string>;
      getDepotPath: (args: string) => Promise<string>;
    }
  }
}
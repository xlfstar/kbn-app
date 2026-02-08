import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // 新增：暴露请求 API 方法，对应主进程的 'request-api' 事件
  requestApi: (options) => {
    return ipcRenderer.invoke('request-api', options)
  }
  // 可在这里添加其他自定义 API
  // invoke: (channel, data) => ipcRenderer.invoke(channel, data) // 通用 IPC 调用方法
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}

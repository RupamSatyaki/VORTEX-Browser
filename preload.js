const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vortexAPI', {
  send:   (channel, data)  => ipcRenderer.send(channel, data),
  on:     (channel, cb)    => ipcRenderer.on(channel, (_e, ...args) => cb(...args)),
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
});

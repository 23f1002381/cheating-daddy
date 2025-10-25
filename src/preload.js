const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
  startSession: (apiKey, profile, language) => ipcRenderer.invoke('start-session', { apiKey, profile, language }),
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  onAIResponse: (callback) => ipcRenderer.on('ai-response', (event, data) => callback(data)),
  moveWindow: (direction) => ipcRenderer.send('move-window', direction),
  toggleClickThrough: () => ipcRenderer.send('toggle-click-through'),
  closeWindow: () => ipcRenderer.send('close-window'),
  startCapture: () => ipcRenderer.invoke('start-capture'),
  stopCapture: () => ipcRenderer.invoke('stop-capture'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings')
});

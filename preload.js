const { contextBridge, ipcRenderer } = require('electron');

const menuChannels = [
  'menu:newText',
  'menu:newCode',
  'menu:newMarkdown',
  'menu:openFile',
  'menu:openFolder',
  'menu:save',
  'menu:saveAs',
  'menu:saveWorkspace',
  'menu:openWorkspace',
  'menu:exportPdf',
  'menu:print',
  'menu:find',
  'menu:workspaceSearch',
  'menu:commandPalette',
  'menu:toggleSidebar',
  'menu:toggleMode',
  'menu:focusMode',
  'menu:markdownPreview'
];

contextBridge.exposeInMainWorld('thoth', {
  ping: () => ipcRenderer.invoke('app:ping'),

  onMenu: (channel, cb) => {
    if (!menuChannels.includes(channel)) return;
    ipcRenderer.removeAllListeners(channel);
    ipcRenderer.on(channel, (_evt, ...args) => cb(...args));
  },

  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  openFolderDialog: () => ipcRenderer.invoke('dialog:openFolder'),
  openWorkspaceDialog: () => ipcRenderer.invoke('dialog:openWorkspace'),
  saveWorkspaceDialog: (payload) => ipcRenderer.invoke('dialog:saveWorkspace', payload),

  listDir: (dirPath) => ipcRenderer.invoke('fs:listDir', dirPath),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  searchFiles: (payload) => ipcRenderer.invoke('fs:searchFiles', payload),

  saveText: (payload) => ipcRenderer.invoke('fs:saveText', payload),
  saveBinaryHex: (payload) => ipcRenderer.invoke('fs:saveBinaryHex', payload),

  saveRecovery: (payload) => ipcRenderer.invoke('recovery:save', payload),
  readRecovery: () => ipcRenderer.invoke('recovery:read'),
  clearRecovery: () => ipcRenderer.invoke('recovery:clear'),

  printHtml: (payload) => ipcRenderer.invoke('print:html', payload),
  exportPdfHtml: (payload) => ipcRenderer.invoke('pdf:exportHtml', payload)
});

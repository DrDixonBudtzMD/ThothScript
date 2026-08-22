const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const APP_NAME = 'ThothScript';
app.setName(APP_NAME);
app.setPath('userData', path.join(app.getPath('appData'), APP_NAME));

const CACHE_DIR = path.join(app.getPath('temp'), `${APP_NAME}-Cache`);
app.commandLine.appendSwitch('disk-cache-dir', CACHE_DIR);
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

const RECOVERY_PATH = path.join(app.getPath('userData'), 'recovery.json');
const BACKUP_DIR = path.join(app.getPath('userData'), 'replace-backups');
const MAX_EDIT_BYTES = 16 * 1024 * 1024;

let win = null;

function send(channel, ...args) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, ...args);
}

function ignoredName(name) {
  return ['node_modules', '.git', '.svn', '.hg', 'dist', 'build', '.next', '.cache', 'out'].includes(String(name).toLowerCase());
}

function isProbablyText(buffer) {
  if (!buffer || buffer.length === 0) return true;
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  let suspicious = 0;
  for (const byte of sample) {
    if (byte === 0) suspicious += 2;
    else if (byte < 7 || (byte > 14 && byte < 32)) suspicious++;
  }
  return suspicious / sample.length < 0.08;
}

function safeReadDir(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  return entries
    .filter(e => !ignoredName(e.name))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(e => {
      const fullPath = path.join(dirPath, e.name);
      return {
        name: e.name,
        path: fullPath,
        type: e.isDirectory() ? 'folder' : 'file'
      };
    });
}

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 660,
    title: APP_NAME,
    backgroundColor: '#080c12',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  buildMenu();
}

function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'New Plain Text', accelerator: 'CmdOrCtrl+N', click: () => send('menu:newText') },
        { label: 'New Code File', accelerator: 'CmdOrCtrl+Shift+N', click: () => send('menu:newCode') },
        { label: 'New Markdown', click: () => send('menu:newMarkdown') },
        { type: 'separator' },
        { label: 'Open File…', accelerator: 'CmdOrCtrl+O', click: () => send('menu:openFile') },
        { label: 'Open Folder…', accelerator: 'CmdOrCtrl+K', click: () => send('menu:openFolder') },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => send('menu:save') },
        { label: 'Save As…', accelerator: 'CmdOrCtrl+Shift+S', click: () => send('menu:saveAs') },
        { type: 'separator' },
        { label: 'Save Workspace…', click: () => send('menu:saveWorkspace') },
        { label: 'Open Workspace…', click: () => send('menu:openWorkspace') },
        { type: 'separator' },
        { label: 'Export PDF…', accelerator: 'CmdOrCtrl+E', click: () => send('menu:exportPdf') },
        { label: 'Print…', accelerator: 'CmdOrCtrl+P', click: () => send('menu:print') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { label: 'Find in Current File', accelerator: 'CmdOrCtrl+F', click: () => send('menu:find') },
        { label: 'Workspace Search', accelerator: 'CmdOrCtrl+Shift+F', click: () => send('menu:workspaceSearch') },
        { label: 'Command Palette', accelerator: 'CmdOrCtrl+Shift+P', click: () => send('menu:commandPalette') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Sidebar', accelerator: 'CmdOrCtrl+B', click: () => send('menu:toggleSidebar') },
        { label: 'Toggle Plain/Code View', accelerator: 'CmdOrCtrl+M', click: () => send('menu:toggleMode') },
        { label: 'Toggle Markdown Preview', accelerator: 'CmdOrCtrl+Shift+V', click: () => send('menu:markdownPreview') },
        { label: 'Focus Mode', accelerator: 'F11', click: () => send('menu:focusMode') },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' }
      ]
    }
  ]));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });

ipcMain.handle('app:ping', async () => ({ ok: true, app: APP_NAME }));

ipcMain.handle('dialog:openFile', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Open File',
    properties: ['openFile'],
    filters: [{ name: 'All Files', extensions: ['*'] }]
  });
  if (res.canceled || !res.filePaths?.[0]) return null;
  return await readFilePayload(res.filePaths[0]);
});

ipcMain.handle('dialog:openFolder', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Open Folder',
    properties: ['openDirectory']
  });
  if (res.canceled || !res.filePaths?.[0]) return null;
  const folderPath = res.filePaths[0];
  return { folderPath, entries: safeReadDir(folderPath) };
});

ipcMain.handle('dialog:openWorkspace', async () => {
  const res = await dialog.showOpenDialog(win, {
    title: 'Open Workspace',
    properties: ['openFile'],
    filters: [{ name: 'ThothScript Workspace', extensions: ['workspace', 'json'] }]
  });
  if (res.canceled || !res.filePaths?.[0]) return null;
  try {
    const filePath = res.filePaths[0];
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return { ok: true, filePath, data };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('dialog:saveWorkspace', async (_evt, payload) => {
  try {
    const res = await dialog.showSaveDialog(win, {
      title: 'Save Workspace',
      defaultPath: path.join(app.getPath('documents'), 'ThothScript.workspace'),
      filters: [{ name: 'ThothScript Workspace', extensions: ['workspace'] }]
    });
    if (res.canceled || !res.filePath) return { ok: false, canceled: true };
    fs.writeFileSync(res.filePath, JSON.stringify(payload || {}, null, 2), 'utf8');
    return { ok: true, filePath: res.filePath };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('fs:listDir', async (_evt, dirPath) => {
  try {
    return { ok: true, entries: safeReadDir(dirPath) };
  } catch (e) {
    return { ok: false, error: String(e.message || e), entries: [] };
  }
});

ipcMain.handle('fs:readFile', async (_evt, filePath) => {
  return await readFilePayload(filePath);
});

ipcMain.handle('fs:searchFiles', async (_evt, payload) => {
  try {
    const root = payload.root;
    const query = String(payload.query || '');
    const replace = String(payload.replace || '');
    const matchCase = !!payload.matchCase;
    const wholeWord = !!payload.wholeWord;
    const useRegex = !!payload.regex;
    const doReplace = !!payload.doReplace;
    const maxFiles = Math.min(Number(payload.maxFiles || 500), 2000);
    if (!root || !query) return { ok: false, error: 'Missing root or query.', results: [] };

    let matcher;
    if (useRegex) {
      matcher = new RegExp(query, matchCase ? 'g' : 'gi');
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      matcher = new RegExp(wholeWord ? `\\b${escaped}\\b` : escaped, matchCase ? 'g' : 'gi');
    }

    const files = [];
    walk(root, files, maxFiles);
    const results = [];

    for (const filePath of files) {
      if (results.length >= 350) break;
      let payload = await readFilePayload(filePath);
      if (!payload.ok || payload.kind !== 'text') continue;
      const content = String(payload.text || '');
      matcher.lastIndex = 0;
      const m = matcher.exec(content);
      if (m) {
        const idx = m.index;
        const line = content.slice(0, idx).split(/\r?\n/).length;
        const start = Math.max(0, idx - 60);
        const end = Math.min(content.length, idx + 140);
        results.push({
          filePath,
          name: path.basename(filePath),
          line,
          preview: content.slice(start, end).replace(/\r?\n/g, ' ')
        });
        if (doReplace) {
          matcher.lastIndex = 0;
          const relative = path.relative(root, filePath);
          const backupPath = path.join(BACKUP_DIR, String(Date.now()), relative);
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.copyFileSync(filePath, backupPath);
          fs.writeFileSync(filePath, content.replace(matcher, replace), 'utf8');
        }
      }
    }

    return { ok: true, results, replaced: doReplace };
  } catch (e) {
    return { ok: false, error: String(e.message || e), results: [] };
  }
});

function walk(dir, out, maxFiles) {
  if (out.length >= maxFiles) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (ignoredName(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out, maxFiles);
    else if (e.isFile()) out.push(p);
    if (out.length >= maxFiles) return;
  }
}

ipcMain.handle('fs:saveText', async (_evt, payload) => {
  try {
    let filePath = payload.filePath;
    if (!filePath || payload.forceSaveAs) {
      const res = await dialog.showSaveDialog(win, {
        title: 'Save File',
        defaultPath: filePath || path.join(app.getPath('documents'), payload.defaultName || 'Untitled.txt')
      });
      if (res.canceled || !res.filePath) return { ok: false, canceled: true };
      filePath = res.filePath;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, String(payload.text ?? ''), 'utf8');
    return { ok: true, filePath };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('fs:saveBinaryHex', async (_evt, payload) => {
  try {
    let hex = String(payload.hex || '').replace(/[^0-9a-fA-F]/g, '');
    if (hex.length % 2 !== 0) return { ok: false, error: 'Hex length must be even.' };
    const buffer = Buffer.from(hex, 'hex');
    let filePath = payload.filePath;
    if (!filePath || payload.forceSaveAs) {
      const res = await dialog.showSaveDialog(win, {
        title: 'Save Binary File',
        defaultPath: filePath || path.join(app.getPath('documents'), payload.defaultName || 'Untitled.bin')
      });
      if (res.canceled || !res.filePath) return { ok: false, canceled: true };
      filePath = res.filePath;
    }
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, buffer);
    return { ok: true, filePath };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('recovery:save', async (_evt, payload) => {
  try {
    fs.writeFileSync(RECOVERY_PATH, JSON.stringify(payload || {}, null, 2), 'utf8');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('recovery:read', async () => {
  try {
    if (!fs.existsSync(RECOVERY_PATH)) return { ok: true, exists: false, data: null };
    const data = JSON.parse(fs.readFileSync(RECOVERY_PATH, 'utf8'));
    return { ok: true, exists: true, data };
  } catch (e) {
    return { ok: false, error: String(e.message || e), exists: false, data: null };
  }
});

ipcMain.handle('recovery:clear', async () => {
  try {
    if (fs.existsSync(RECOVERY_PATH)) fs.unlinkSync(RECOVERY_PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('print:html', async (_evt, payload) => {
  let printWin = null;
  try {
    printWin = new BrowserWindow({
      show: false,
      width: 900,
      height: 1200,
      backgroundColor: '#ffffff',
      webPreferences: { contextIsolation: true, sandbox: true }
    });
    await printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(String(payload?.html || '')));
    return await new Promise((resolve) => {
      printWin.webContents.print({ printBackground: true }, (success, failureReason) => {
        if (printWin && !printWin.isDestroyed()) printWin.destroy();
        resolve(success ? { ok: true } : { ok: false, error: failureReason || 'Print failed.' });
      });
    });
  } catch (e) {
    if (printWin && !printWin.isDestroyed()) printWin.destroy();
    return { ok: false, error: String(e.message || e) };
  }
});

ipcMain.handle('pdf:exportHtml', async (_evt, payload) => {
  try {
    const res = await dialog.showSaveDialog(win, {
      title: 'Export PDF',
      defaultPath: path.join(app.getPath('documents'), payload.suggestedName || 'ThothScript.pdf'),
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });
    if (res.canceled || !res.filePath) return { ok: false, canceled: true };

    const pdfWin = new BrowserWindow({
      show: false,
      width: 900,
      height: 1200,
      backgroundColor: '#ffffff',
      webPreferences: { contextIsolation: true, sandbox: true }
    });

    await pdfWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(String(payload.html || '')));
    const pdfData = await pdfWin.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      margins: { marginType: 'default' }
    });

    fs.writeFileSync(res.filePath, pdfData);
    pdfWin.destroy();
    return { ok: true, filePath: res.filePath };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
});

async function readFilePayload(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const stat = fs.statSync(filePath);
    if (stat.size > MAX_EDIT_BYTES) {
      return {
        ok: false,
        filePath,
        error: `File is ${(stat.size / 1024 / 1024).toFixed(1)} MB. ThothScript currently limits editable files to 16 MB to prevent freezes.`
      };
    }
    const isText = isProbablyText(buffer);
    if (isText) {
      return {
        ok: true,
        filePath,
        name: path.basename(filePath),
        size: stat.size,
        kind: 'text',
        text: buffer.toString('utf8')
      };
    }
    return {
      ok: true,
      filePath,
      name: path.basename(filePath),
      size: stat.size,
      kind: 'binary',
      hex: buffer.toString('hex')
    };
  } catch (e) {
    return { ok: false, filePath, error: String(e.message || e) };
  }
}

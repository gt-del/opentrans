const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  selectDirectory: () =>
    ipcRenderer.invoke('select-directory'),

  selectOutputDirectory: () =>
    ipcRenderer.invoke('select-output-directory'),

  cloneProject: (srcDir, copyOptions) =>
    ipcRenderer.invoke('clone-project', srcDir, copyOptions),

  showSpecialFilesDialog: (skippedFiles) =>
    ipcRenderer.invoke('show-special-files-dialog', skippedFiles),

  // both srcDir and translatorDir needed by the main handler
  getFileTree: (srcDir, translatorDir) =>
    ipcRenderer.invoke('get-file-tree', srcDir, translatorDir),

  // settings forwarded so main can update concurrency/apiConfig
  translateFile: (filePath, srcDir, translatorDir, settings) =>
    ipcRenderer.invoke('translate-file', filePath, srcDir, translatorDir, settings),

  getFileContent: (filePath) =>
    ipcRenderer.invoke('get-file-content', filePath),

  // destPath, content, srcPath, translatorDir
  saveTranslation: (destPath, content, srcPath, translatorDir) =>
    ipcRenderer.invoke('save-translation', destPath, content, srcPath, translatorDir),

  startBatchTranslate: (srcDir, translatorDir, settings) =>
    ipcRenderer.invoke('start-batch-translate', srcDir, translatorDir, settings),

  onTranslationProgress: (callback) => {
    ipcRenderer.on('translation-progress', (_event, data) => callback(data))
    return () => ipcRenderer.removeAllListeners('translation-progress')
  }
})

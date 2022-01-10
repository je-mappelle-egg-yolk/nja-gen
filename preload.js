const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    loadFilesAPI: {
        openLoadFilesDialogue() {
            ipcRenderer.send('open-load-files-dialogue');
        }
    }
})


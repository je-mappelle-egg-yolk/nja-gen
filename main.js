const { app, BrowserWindow, shell, dialog, Menu, ipcMain } = require('electron');
const fs = require('fs');

const path = require('path');

const isDev = !app.isPackaged;

function createWindow(){
    var win = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        webPreferences: {
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            contextIsolation: true
        },
        icon:'./src/assets/icons/icon.png'
    })

    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    //win.setMenu(null);
    win.loadFile('index.html');
    win.on('closed', function(){
        win = null
    })
}

//Brower auto reload
if(isDev){
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
}

//Create window
app.whenReady().then(createWindow)

//Shut off process
app.on('window-all-closed', function (){
    if(process.platform !== 'darwin'){
        app.quit()
    }
})

//Remove content security warning
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';


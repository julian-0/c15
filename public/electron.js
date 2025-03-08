const electron = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const loadBalancer = require('electron-load-balancer');

const { app } = electron;
const { BrowserWindow } = electron;
const nativeImage = electron.nativeImage;

const storage = require('electron-json-storage');
const dataPath = storage.getDataPath();
console.log(dataPath);

if (process.env.DEV) {
    const {
        default: installExtension,
        REDUX_DEVTOOLS,
        REACT_DEVELOPER_TOOLS,
    } = require('electron-devtools-installer');

    app.whenReady().then(() => {
        installExtension(REDUX_DEVTOOLS).then(name =>
            console.log(`Added Extension:  ${name}`),
        );
        installExtension(REACT_DEVELOPER_TOOLS).then(name =>
            console.log(`Added Extension:  ${name}`),
        );
    });
}else{
    app.whenReady().then(() => {
        console.log("Aplicacion iniciada")
        console.log(`Dirname:  ${__dirname}`);
    });
}

const icon = nativeImage.createFromPath(path.join(__dirname, 'eymblue.png'));
let mainWindow;

function createWindow() {
    const startUrl = process.env.DEV
        ? 'http://127.0.0.1:3000'
        : url.format({
            pathname: path.join(__dirname, '/../build/index.html'),
            protocol: 'file:',
            slashes: true,
        });
    mainWindow = new BrowserWindow({
        show: false,
        icon,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        },
        minWidth: 500,
        minHeight: 300,
    });
    !process.env.DEV && mainWindow.removeMenu();
    mainWindow.maximize();
    mainWindow.show();

    mainWindow.loadURL(startUrl);
    process.env.DEV && mainWindow.webContents.openDevTools();
    //mainWindow.webContents.openDevTools();

    mainWindow.on('uncaughtException', function (error) {
        console.log("log 1");
        console.log(error);
    });

    mainWindow.on('closed', function () {
        try{
            loadBalancer.stopAll();
        }
        catch(error){
            console.log("error en stopAll");
            console.log(error);
        }
        mainWindow = null;
    });
}

app.commandLine.appendSwitch('force-color-profile', 'srgb');

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('uncaughtException', function (error) {
    console.log("log 2");
    console.log(error);
});

/* ----------------------------------- Custom code starts here ------------------------------------- */

// 1. Register background tasks (the keys will be used for reference later)
loadBalancer.register(
  ipcMain,
  {
    controller: '/background_tasks/controller2.html'
  },
  { debug: false },
);

// 2. Set up eventlisteners to bounce message from background to UI 
ipcMain.on('CONTROLLER_RESULT', (event, args) => {
    let eventName = 'CONTROLLER_RESULT_' + args.data.source;
    mainWindow.webContents.send(eventName, args);
});

ipcMain.on('fetch-data-from-storage', (event, message) => {
    console.log("main received: FETCH_DATA_FROM_STORAGE with name", message);
    storage.get(message, (error, data) => {
        
        if (error){
            mainWindow.send('handle-fetch-data', {
                succes: false,
                message: "cpuConfig not returned"
            });
        }
        else{
            mainWindow.send('handle-fetch-data', {
                succes: true,
                message: data
            });
        }
    });

});

ipcMain.on('save-data-in-storage', (event, message) => {
    console.log("main received: SAVE_DATA_IN_STORAGE with name", message);
    storage.set("cpuDefaultConfig", message, (error) => {
        if (error){
            mainWindow.send('handle-save-data', {
                succes: false,
                message: "cpuConfig not saved"
            });
        }
        else{
            mainWindow.send('handle-save-data', {
                succes: true,
                message: message
            });
        }
    });
});

ipcMain.on('uncaughtException', function (error) {
    console.log("log 3");
    console.log(error);
});
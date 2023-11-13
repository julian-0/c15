const electron = require('electron');
const path = require('path');
const url = require('url');
const { ipcMain } = require('electron');
const loadBalancer = require('electron-load-balancer');

const { app } = electron;
const { BrowserWindow } = electron;
const nativeImage = electron.nativeImage;

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

    mainWindow.on('closed', function () {
        loadBalancer.stopAll();
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

/* ----------------------------------- Custom code starts here ------------------------------------- */

// 1. Register background tasks (the keys will be used for reference later)
loadBalancer.register(
  ipcMain,
  {
    controller: '/background_tasks/controller.html'
  },
  { debug: false },
);

// 2. Set up eventlisteners to bounce message from background to UI 
ipcMain.on('CONTROLLER_RESULT', (event, args) => {
    let eventName = 'CONTROLLER_RESULT_' + args.data.source;
    mainWindow.webContents.send(eventName, args);
});
const { app, BrowserWindow, autoUpdater, session } = require("electron");
const log = require("electron-log");
const ipcMain = require("electron").ipcMain;
const settings = require('electron-settings');
require('./globals.js');

const cookie = { url: 'prod.escapefromtarkov.com', name: 'PHPSESSID=', value: 't5nbfudkl0xi0e52xg77u365qhumprs7' }


const createMain = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: { webSecurity: false, allowRunningInsecureContent: true, nodeIntegration: true },
      frame: false,
      resizable: false,
    });
  
    //log.info("mainWindow created");
  
    // and load the index.html of the app.
    mainWindow.loadURL(`file:///${__dirname}\\index.html`);
    //log.info(`file:///${__dirname}\\index.html`);
    //log.info("Loaded mainWindow");
  
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  
    // Emitted when the window is closed.
    mainWindow.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null;
      app.quit();
    });
  
    app.on('window-all-closed', function() {
      // On OS X it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })
  }

  app.on("ready", function() {
    log.info("App is ready...");

    createMain();

    ipcMain.on("run-clientrequests", () => {
      //log.info("Rx run client requests");

      //globals
      client_f.ClientRequests();
    });
  
    app.on("activate", () => {
      // On OS X it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if(mainWindow === null) {
        createMain();
      }
    });
  });

// console.log(">Launcher Url: " + launcher_url);
// console.log(">Game Url: " + url);
// console.log(">Trading Url: " + url_trade);
/* **** starting dumping launcher responses **** */
//console.log("\ngame and launcher versions ...");

//launcher_f.LauncherRequests(); //UNCOMMENT THIS LATER


/* **** starting dumping game responses **** */
//client_f.ClientRequests();
/* **** Finished **** */

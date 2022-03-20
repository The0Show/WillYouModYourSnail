const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const { openNewGitHubIssue, debugInfo } = require("electron-util");
const { readFileSync } = require("fs");
const path = require("path");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
    // eslint-disable-line global-require
    app.quit();
}

/**
 * @type {BrowserWindow}
 */
let mainWindow, crashWindow;

/**
 * Parses the scene directory to be sent to {@link BrowserWindow.loadFile loadFile} on a {@link BrowserWindow}
 * @param {string} sceneName
 * @returns {string} The parsed scene directory to be sent to {@link BrowserWindow.loadFile loadFile} on a {@link BrowserWindow}
 */
function parseSceneDir(sceneName) {
    return `${__dirname}/Interface/${sceneName}.html`;
}

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        title: "Will You Mod Your Snail",
        center: true,
        minWidth: 1050,
        width: 1050,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: `${__dirname}/Assets/JavaScript/preload.js`,
        },
    });
    Menu.setApplicationMenu(app.isPackaged ? null : Menu.getApplicationMenu());

    mainWindow.loadFile(parseSceneDir("mods"));
});

/**
 * Handles errors.
 * @param {Error} err
 */
function handleError(err) {
    console.error(err);

    // Create crash window
    crashWindow = new BrowserWindow({
        title: "Will You Mod Your Snail - Crash Report",
        center: true,
        resizable: false,
        maximizable: false,
        width: 608,
        height: 320,
        webPreferences: {
            preload: `${__dirname}/Assets/JavaScript/crash.js`,
        },
    });

    Menu.setApplicationMenu(null);

    crashWindow.loadFile(`${__dirname}/Interface/crash.html`);

    crashWindow.focus();

    // Now destroy the windows, since the crash window is ready
    mainWindow.destroy();

    ipcMain.on("crashAction", (event, action) => {
        // i tried a switch statement for this, but it never worked :(

        if (action === 0)
            openNewGitHubIssue({
                user: "WillYouModYourSnail",
                repo: "WYMYS-Loader",
                title: `${err.name}`,
                body: `${debugInfo()}\n----------------\n${err.stack}`,
            });

        if (action === 1) app.relaunch();

        if (action > 0) app.exit(-1);
    });
}

ipcMain.on("triggerCrash", (event, err) => {
    throw err;
});

process.on("uncaughtException", handleError);

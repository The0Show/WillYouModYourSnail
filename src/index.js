const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell,
    globalShortcut,
    dialog,
} = require("electron");
const { openNewGitHubIssue, debugInfo } = require("electron-util");
const fs = require("fs-extra");
const unhandled = require("electron-unhandled");

// function handleStartupEvent() {
//     if (process.platform !== "win32") {
//         return false;
//     }

//     var squirrelCommand = process.argv[1];
//     switch (squirrelCommand) {
//         case "--squirrel-install":
//         case "--squirrel-updated":
//             // Optionally do things such as:
//             //
//             // - Install desktop and start menu shortcuts
//             // - Add your .exe to the PATH
//             // - Write to the registry for things like file associations and
//             //   explorer context menus

//             // Always quit when done
//             app.quit();

//             return true;
//         case "--squirrel-uninstall":
//             // Undo anything you did in the --squirrel-install and
//             // --squirrel-updated handlers

//             // Always quit when done
//             app.quit();

//             return true;
//         case "--squirrel-obsolete":
//             // This is called on the outgoing version of your app before
//             // we update to the new version - it's the opposite of
//             // --squirrel-updated
//             app.quit();
//             return true;
//     }
// }

// if (handleStartupEvent()) {
//     app.exit();
// }

unhandled({
    showDialog: true,
    reportButton: (error) => {
        openNewGitHubIssue({
            user: "WillYouModYourSnail",
            repo: "WYMYS-Loader",
            title: `${error.message}`,
            body: `${debugInfo()}\n---------------------------\n${error.stack}`,
        });
    },
});

/**
 * @type {BrowserWindow}
 */
let mainWindow;

/**
 * Parses the scene directory to be sent to {@link BrowserWindow.loadFile loadFile} on a {@link BrowserWindow}
 * @param {string} sceneName
 * @returns {string} The parsed scene directory to be sent to {@link BrowserWindow.loadFile loadFile} on a {@link BrowserWindow}
 */
function parseSceneDir(sceneName) {
    return `${__dirname}/Interface/${sceneName}.html`;
}

app.on("ready", () => {
    const appData = `${app.getPath("appData")}\\wymys-loader`;

    if (!fs.existsSync(`${appData}\\ModManifests`))
        fs.mkdirSync(`${appData}\\ModManifests`);
    if (!fs.existsSync(`${appData}\\ModPatches`))
        fs.mkdirSync(`${appData}\\ModPatches`);

    mainWindow = new BrowserWindow({
        title: "Will You Mod Your Snail",
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: `${__dirname}/Assets/JavaScript/preload.js`,
        },
    });
    Menu.setApplicationMenu(app.isPackaged ? null : Menu.getApplicationMenu());

    const client = require("discord-rich-presence")("967088639886655568");

    client.updatePresence({
        details: "Modding their snail",
        largeImageKey: "snail",
        startTimestamp: Date.now(),
        instance: true,
    });

    mainWindow.loadFile(parseSceneDir("init"));

    mainWindow.on("unresponsive", async (err) => {
        const unresDialog = await dialog.showMessageBox(null, {
            buttons: ["Wait", "Relaunch", "Quit"],
            message:
                "Will You Mod Your Snail is not responding. What would you like to do?",
            title: "Will You Mod Your Snail",
            type: "info",
        });

        switch (unresDialog.response) {
            case 1:
                app.relaunch();
                app.exit();
                break;

            case 2:
                app.exit();
                break;

            default:
                break;
        }
    });

    // This allows _blank to open in the user's browser rather than a new Electron window.
    mainWindow.webContents.on("new-window", function (e, url) {
        e.preventDefault();
        require("electron").shell.openExternal(url);
    });
});

app.on("browser-window-focus", () => {
    globalShortcut.register("Control+R", () => {
        app.relaunch();
        app.exit();
    });

    globalShortcut.register("Control+Shift+R", () => {
        mainWindow.reload();
    });

    globalShortcut.register("Control+Shift+I", () => {
        mainWindow.webContents.openDevTools();
    });

    globalShortcut.register("F8", () => {
        require("electron").shell.openExternal(
            "https://github.com/WillYouModYourSnail/WYMYS-Manager/issues/new/choose"
        );
    });
});

app.on("browser-window-blur", () => {
    globalShortcut.unregisterAll();
});

ipcMain.on("triggerCrash", (event, err) => {
    throw err;
});

ipcMain.handle("appDataReq", (event, args) => {
    return `${app.getPath("appData")}\\wymys-loader`;
});

ipcMain.handle("uploadModFile", async (event, args) => {
    const file = await dialog.showOpenDialog(null, {
        properties: [
            "openFile",
            "dontAddToRecent",
            "createDirectory",
            "showHiddenFiles",
        ],
        title: "Select your mod file(s)",
        filters: [
            {
                name: "Will You Snail Mods",
                extensions: ["wysmod"],
            },
            {
                name: "FLIPS BPS Output",
                extensions: ["bps"],
            },
        ],
    });

    return file.filePaths[0];
});

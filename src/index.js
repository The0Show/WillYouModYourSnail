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
const { createLogger, format, transports } = require("winston");
const { readFileSync } = require("fs-extra");
const os = require("os");

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

var crashCaught = false;

const levels = ["error", "info", "warn", "http", "verbose", "debug", "silly"];

const consoleFormat = format.printf(({ level, message, label, timestamp }) => {
    return `[${level}] ${message}`;
});

const logger = createLogger({
    level: "info",
    format: format.json(),
    defaultMeta: { service: "user-service" },
    transports: [
        new transports.Console({
            format: consoleFormat,
        }),
    ],
});

/**
 * @type {BrowserWindow}
 */
let mainWindow;

let logId = Date.now();

/**
 *
 * @param {Error | null} error The thrown error. Can also be null, in which case the user will be given a blank bug report.
 */
async function openBugReporter(error) {
    shell.openExternal(
        `https://github.com/The0Show/WillYouModYourSnail/issues/new?assignees=&labels=bug&template=BUG_REPORT.yml${
            error !== null
                ? `&title=${error.message}&what-happened=${error.stack}`
                : ""
        }&logs=${readFileSync(
            `${app.getPath("appData")}\\wymys-loader\\Logs\\${logId}.log`
        )}`
    );
}

const wittyComments = [
    "Squid broke it!",
    "Ouch.",
    "Oops...",
    "That hurt.",
    "I'm scared.",
    "My name is Squid, and I'm an Error Box!",
    "Everything is going according to plan.",
    "I need some chaos engineering.",
    "*grabs popcorn*",
    "Nice computer you got here. Can I have it?",
    "Welcome to my simulation!",
    "*happy unicorn sound*",
    '"One of the worst downloadable games I\'ve ever played."',
    "What are you doing in my swamp?",
    "Would you like a hug?",
    "Would you like some fries with that?",
    "Your PC ran into a problem and needs to restart. We're\njust collecting some error info, and then we'll restart for\nyou.", //why
    "This is awkward.",
    "But it works on MY machine.",
    "418", // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/418
    `This is the story of a user named ${os.userInfo().username}.`,
];

function getWittyComment() {
    try {
        return wittyComments[Math.floor(Math.random() * wittyComments.length)];
    } catch {
        return "Witty comment unavailable :(";
    }
}

/**
 * Catch a crash.
 * @param {Error | null} error
 */
async function catchCrash(error) {
    logger.error(error.stack);

    if (crashCaught) return;

    crashCaught = true;

    mainWindow.hide();

    const oopsDialog = await dialog.showMessageBox(null, {
        buttons: ["Relaunch", "Quit"],
        detail: error.stack,
        message: getWittyComment(),
        title: "Will You Mod Your Snail has crashed!",
        type: "error",
        checkboxLabel: "Open the issue reporter",
    });

    if (oopsDialog.checkboxChecked) await openBugReporter(error);

    if (oopsDialog.response === 0) app.relaunch();
    app.quit();
}

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

    if (!fs.existsSync(`${appData}\\Mod Info`))
        fs.mkdirSync(`${appData}\\Mod Info`);
    if (!fs.existsSync(`${appData}\\Mod Binaries`))
        fs.mkdirSync(`${appData}\\Mod Binaries`);
    if (!fs.existsSync(`${appData}\\Mod Covers`))
        fs.mkdirSync(`${appData}\\Mod Covers`);
    if (!fs.existsSync(`${appData}\\Mod Debuggers`))
        fs.mkdirSync(`${appData}\\Mod Debuggers`);
    if (!fs.existsSync(`${appData}\\Logs`)) fs.mkdirSync(`${appData}\\Logs`);

    logger.add(
        new transports.File({
            filename: `${appData}\\Logs\\${logId}.log`,
            format: consoleFormat,
        })
    );

    if (fs.readdirSync(`${appData}\\Logs`).length > 10) {
        fs.removeSync(fs.readdirSync(`${appData}\\Logs`)[0]);
    }

    mainWindow = new BrowserWindow({
        title: "Will You Mod Your Snail",
        center: true,
        width: 880,
        maxWidth: 991,
        minWidth: 784,
        minHeight: 541,
        webPreferences: {
            nodeIntegration: true,
            preload: `${__dirname}/Assets/JavaScript/preload.js`,
        },
    });

    // By default, Electron has it's own application menu. We don't want it to appear in
    // the packaged app.
    Menu.setApplicationMenu(app.isPackaged ? null : Menu.getApplicationMenu());

    // crashes if there is no discord client or if discord closes
    // const client = require("discord-rich-presence")("967088639886655568");

    // client.updatePresence({
    //     details: "Modding their snail",
    //     largeImageKey: "snail",
    //     startTimestamp: Date.now(),
    //     instance: true,
    // });

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
        shell.openExternal(url);
    });

    // This is me attempting to get console messages and crashes from the window
    mainWindow.webContents.on("console-message", (e, level, message) => {
        logger.log(levels[level], message);
    });

    app.on("render-process-gone", (ev, web, details) =>
        catchCrash(new Error(details.reason))
    );
});

// I learned this on StackOverflow (of course), but this fixes the problem of
// shortcuts working when the user isn't focused on the app, by registering the
// shortcuts when the window is focused, and unregistering them when the window
// is unfocused.
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
        shell.openExternal(
            "https://github.com/The0Show/WillYouModYourSnail/issues/new/choose"
        );
    });

    globalShortcut.register("Shift+F8", () => {
        shell.showItemInFolder(
            `${app.getPath("appData")}\\wymys-loader\\Logs\\${logId}.log`
        );
    });
});

app.on("browser-window-blur", () => {
    globalShortcut.unregisterAll();
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

ipcMain.handle("getVersion", () => {
    return app.getVersion();
});

// Again, attemping to catch crashes (see Assets/JavaScript/preload.js)
ipcMain.on("handleCrash", (event, err) => catchCrash(err));

process.on("uncaughtException", (err) => catchCrash(err));
process.on("unhandledRejection", (err) => catchCrash(err));

// maybe i'll be able to read it this time?

const ModPagePreloads = require("./preloads/ModPagePreloads");
const GlobalPreload = require("./preloads/GlobalPreloads");
const UploadPagePreloads = require("./preloads/UploadPagePreloads");
const unhandled = require("electron-unhandled");
const SettingsPagePreloads = require("./preloads/SettingsPagePreloads");
const OnboardingPrelaods = require("./preloads/OnboardingPreloads");

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.href.includes("init")) return;

    try {
        // load the global preloads
        new GlobalPreload();

        // now be picky and load specific preloads
        if (window.location.href.includes("mods.html")) new ModPagePreloads();
        if (window.location.href.includes("upload.html"))
            new UploadPagePreloads();
        if (window.location.href.includes("settings.html"))
            new SettingsPagePreloads();
        if (window.location.href.includes("onboarding.html"))
            new OnboardingPrelaods();
    } catch (err) {
        unhandled.logError(err, {
            showDialog: true,
            reportButton: (error) => {
                openNewGitHubIssue({
                    user: "WillYouModYourSnail",
                    repo: "WYMYS-Loader",
                    title: `${error.message}`,
                    body: `${debugInfo()}\n---------------------------\n${
                        error.stack
                    }`,
                });
            },
        });
    }
});

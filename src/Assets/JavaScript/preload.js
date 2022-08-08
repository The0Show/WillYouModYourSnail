// maybe i'll be able to read it this time?

const ModPagePreloads = require("./preloads/ModPagePreloads");
const GlobalPreload = require("./preloads/GlobalPreloads");
const UploadPagePreloads = require("./preloads/UploadPagePreloads");
const unhandled = require("electron-unhandled");
const SettingsPagePreloads = require("./preloads/SettingsPagePreloads");
const OnboardingPrelaods = require("./preloads/OnboardingPreloads");
const { ipcRenderer } = require("electron");
const ToolsPagePreloads = require("./preloads/ToolsPagePreloads");

document.addEventListener("DOMContentLoaded", () => {
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
		if (window.location.href.includes("tools.html"))
			new ToolsPagePreloads();
	} catch (err) {
		// try to catch crashes
		ipcRenderer.send("handleCrash", err);
	}
});

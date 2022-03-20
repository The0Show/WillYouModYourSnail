const { ipcRenderer } = require("electron");

function startPreload() {
    try {
        if (window.location.href.includes("tools.html")) {
            document
                .getElementById("crashButton")
                .addEventListener("click", () => {
                    ipcRenderer.send("triggerCrash", new Error("ben"));
                });
        }
    } catch (err) {
        ipcRenderer.send("triggerCrash", err);
    }
}

if (document.readyState !== "loading") {
    startPreload();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        startPreload();
    });
}

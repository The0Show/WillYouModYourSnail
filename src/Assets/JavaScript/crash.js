const { ipcRenderer } = require("electron");

function buttonStuff() {
    // report error
    document
        .querySelectorAll("button")[0]
        .addEventListener("click", () => ipcRenderer.send("crashAction", 0));

    // restart app
    document
        .querySelectorAll("button")[1]
        .addEventListener("click", () => ipcRenderer.send("crashAction", 1));

    // exit app
    document
        .querySelectorAll("button")[2]
        .addEventListener("click", () => ipcRenderer.send("crashAction", 2));
}

if (document.readyState !== "loading") {
    buttonStuff();
} else {
    document.addEventListener("DOMContentLoaded", function () {
        buttonStuff();
    });
}

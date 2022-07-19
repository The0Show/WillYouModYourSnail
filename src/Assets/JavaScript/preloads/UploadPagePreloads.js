const { ipcRenderer, app } = require("electron");
const {
    writeFileSync,
    writeJSONSync,
    copyFileSync,
    readdirSync,
    existsSync,
    readJSONSync,
} = require("fs-extra");
const StreamZip = require("node-stream-zip");
const WYSMOD = require("../../../Classes/WYSMOD");
const exec = require("child_process").exec;

class UploadPagePreloads {
    /**
     * eat mods
     */
    constructor() {
        this.appData = "";

        ipcRenderer.invoke("appDataReq", []).then((res) => {
            this.appData = res;
        });

        this.alertPlaceholder = document.getElementById("responseAlerts");

        document
            .getElementById("drop_zone")
            .addEventListener("drop", async (event) => {
                const file = event.dataTransfer.files[0];

                this.InstallMod(file);
            });
    }

    sendUploadResponse(message, type) {
        let wrapper = document.createElement("div");
        wrapper.innerHTML =
            '<div class="alert alert-' +
            type +
            ' alert-dismissible" style="margin-left: 10px; margin-right: 10px" role="alert">' +
            message +
            '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';

        this.alertPlaceholder.append(wrapper);
    }

    async InstallMod(file) {
        try {
            if (file.name.endsWith(".wysmod")) {
                const wysmodReader = new WYSMOD();

                wysmodReader.readWYSMODFile(file.path);
                wysmodReader
                    .parseFileData()
                    .then(() => {
                        try {
                            var modAlreadyExists = false;

                            if (
                                existsSync(
                                    `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`
                                ) ||
                                existsSync(
                                    `${this.appData}\\Mod Binaries\\${wysmodReader.parsedFileData.metadata.id}`
                                )
                            ) {
                                modAlreadyExists =
                                    readJSONSync(
                                        `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`
                                    ).version ===
                                    wysmodReader.parsedFileData.metadata
                                        .version;
                            }

                            wysmodReader.parsedFileData.metadata.enabled = true;
                            wysmodReader.parsedFileData.metadata.isCoreMod = false;
                            writeJSONSync(
                                `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`,
                                wysmodReader.parsedFileData.metadata
                            );

                            writeFileSync(
                                `${this.appData}\\Mod Binaries\\${wysmodReader.parsedFileData.metadata.id}`,
                                wysmodReader.parsedFileData.modBinary
                            );

                            if (
                                wysmodReader.parsedFileData.modCover
                                    .byteLength > 0
                            )
                                writeFileSync(
                                    `${this.appData}\\Mod Covers\\${wysmodReader.parsedFileData.metadata.id}`,
                                    wysmodReader.parsedFileData.modCover
                                );

                            if (
                                wysmodReader.parsedFileData.modDebugger
                                    .byteLength > 0
                            )
                                writeFileSync(
                                    `${this.appData}\\Mod Debuggers\\${wysmodReader.parsedFileData.metadata.id}`,
                                    wysmodReader.parsedFileData.modDebugger
                                );

                            if (modAlreadyExists) {
                                this.sendUploadResponse(
                                    `Mod with same ID and version already exists, replaced with ${wysmodReader.parsedFileData.metadata.name} v${wysmodReader.parsedFileData.metadata.version}`,
                                    "warning"
                                );
                            } else {
                                this.sendUploadResponse(
                                    `Successfully installed ${wysmodReader.parsedFileData.metadata.name} v${wysmodReader.parsedFileData.metadata.version}!`,
                                    "success"
                                );
                            }
                        } catch (err) {
                            this.sendUploadResponse(
                                `Install failed!<br>${err.message}`,
                                "danger"
                            );
                        }
                    })
                    .catch((err) => {
                        this.sendUploadResponse(
                            `Install failed!<br>${err.message}`,
                            "danger"
                        );
                    });
            } else if (file.name.endsWith(".zip")) {
                try {
                    throw new Error("put zip code here");
                } catch (err) {
                    this.sendUploadResponse(
                        `Install failed!<br>${err.message}`,
                        "danger"
                    );
                }
            } else if (file.name.endsWith(".bps")) {
                this.sendUploadResponse(
                    `Patch mods are currently not supported.<br>Please install them manually.`,
                    "danger"
                );
            } else {
                this.sendUploadResponse(`Unsupported filetype`, "danger");
            }
        } catch (err) {
            this.sendUploadResponse(
                `Could not install due to ${err.name}:<br>${err.message}`,
                "danger"
            );
        }
    }
}

module.exports = UploadPagePreloads;

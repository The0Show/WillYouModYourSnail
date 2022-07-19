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
                            writeJSONSync(
                                `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`,
                                wysmodReader.parsedFileData.metadata
                            );

                            writeFileSync(
                                `${this.appData}\\Mod Binaries\\${wysmodReader.parsedFileData.metadata.id}`,
                                wysmodReader.parsedFileData.file
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
            } else if (file.name.endsWith(".dll")) {
                try {
                    let version;

                    exec(
                        `wmic datafile where name='${file.path
                            .toLowerCase()
                            .replaceAll("\\", "\\\\")}' get Version`,
                        function (err, stdout, stderr) {
                            version = stdout;
                        }
                    );

                    setTimeout(() => {
                        if (version) {
                            var modAlreadyExists = false;

                            if (
                                existsSync(
                                    `${
                                        this.appData
                                    }\\Mod Info\\dllimport.willyoumodyoursnail.${file.name
                                        .replace(".dll", "")
                                        .toLowerCase()}`
                                ) ||
                                existsSync(
                                    `${
                                        this.appData
                                    }\\Mod Binaries\\dllimport.willyoumodyoursnail.${file.name
                                        .replace(".dll", "")
                                        .toLowerCase()}`
                                )
                            ) {
                                modAlreadyExists =
                                    readJSONSync(
                                        `${
                                            this.appData
                                        }\\Mod Info\\dllimport.willyoumodyoursnail.${file.name
                                            .replace(".dll", "")
                                            .toLowerCase()}`
                                    ).version ===
                                    `${version.split("\n")[1].split(".")[0]}.${
                                        version.split("\n")[1].split(".")[1]
                                    }.${version.split("\n")[1].split(".")[2]}`;
                            }

                            writeJSONSync(
                                `${
                                    this.appData
                                }\\Mod Info\\dllimport.willyoumodyoursnail.${file.name
                                    .replace(".dll", "")
                                    .toLowerCase()}`,
                                {
                                    id: `dllimport.willyoumodyoursnail.${file.name
                                        .replace(".dll", "")
                                        .toLowerCase()}`,
                                    name: file.name.replace(".dll", ""),
                                    version: `${
                                        version.split("\n")[1].split(".")[0]
                                    }.${version.split("\n")[1].split(".")[1]}.${
                                        version.split("\n")[1].split(".")[2]
                                    }`,
                                    authors: [],
                                    description: "",
                                    dependencies: [],
                                    enabled: true,
                                }
                            );

                            copyFileSync(
                                file.path,
                                `${
                                    this.appData
                                }\\Mod Binaries\\dllimport.willyoumodyoursnail.${file.name
                                    .replace(".dll", "")
                                    .toLowerCase()}`
                            );

                            if (modAlreadyExists) {
                                this.sendUploadResponse(
                                    `Mod with same ID and version already exists, replaced with ${
                                        file.name
                                    } v${
                                        version.split("\n")[1].split(".")[0]
                                    }.${version.split("\n")[1].split(".")[1]}.${
                                        version.split("\n")[1].split(".")[2]
                                    }!`,
                                    "warning"
                                );
                            } else {
                                this.sendUploadResponse(
                                    `Successfully installed ${file.name} v${
                                        version.split("\n")[1].split(".")[0]
                                    }.${version.split("\n")[1].split(".")[1]}.${
                                        version.split("\n")[1].split(".")[2]
                                    }!`,
                                    "success"
                                );
                            }
                        }
                    }, 1000);
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

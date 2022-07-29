const { ipcRenderer, app } = require("electron");
const {
    readFileSync,
    copyFileSync,
    readJSONSync,
    mkdirSync,
    rmSync,
    writeJSONSync,
} = require("fs-extra");
const StreamZip = require("node-stream-zip");
const { join } = require("path");
const WYSMOD = require("../../../Classes/WYSMOD");
const glob = require("glob");

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
            // if (file.name.endsWith(".wysmod")) {
            //     const wysmodReader = new WYSMOD();

            //     wysmodReader.readWYSMODFile(file.path);
            //     wysmodReader
            //         .parseFileData()
            //         .then(() => {
            //             try {
            //                 var modAlreadyExists = false;

            //                 if (
            //                     existsSync(
            //                         `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`
            //                     ) ||
            //                     existsSync(
            //                         `${this.appData}\\Mod Binaries\\${wysmodReader.parsedFileData.metadata.id}`
            //                     )
            //                 ) {
            //                     modAlreadyExists =
            //                         readJSONSync(
            //                             `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`
            //                         ).version ===
            //                         wysmodReader.parsedFileData.metadata
            //                             .version;
            //                 }

            //                 wysmodReader.parsedFileData.metadata.enabled = true;
            //                 wysmodReader.parsedFileData.metadata.isCoreMod = false;
            //                 writeJSONSync(
            //                     `${this.appData}\\Mod Info\\${wysmodReader.parsedFileData.metadata.id}`,
            //                     wysmodReader.parsedFileData.metadata
            //                 );

            //                 writeFileSync(
            //                     `${this.appData}\\Mod Binaries\\${wysmodReader.parsedFileData.metadata.id}`,
            //                     wysmodReader.parsedFileData.modBinary
            //                 );

            //                 if (
            //                     wysmodReader.parsedFileData.modCover
            //                         .byteLength > 0
            //                 )
            //                     writeFileSync(
            //                         `${this.appData}\\Mod Covers\\${wysmodReader.parsedFileData.metadata.id}`,
            //                         wysmodReader.parsedFileData.modCover
            //                     );

            //                 if (
            //                     wysmodReader.parsedFileData.modDebugger
            //                         .byteLength > 0
            //                 )
            //                     writeFileSync(
            //                         `${this.appData}\\Mod Debuggers\\${wysmodReader.parsedFileData.metadata.id}`,
            //                         wysmodReader.parsedFileData.modDebugger
            //                     );

            //                 if (modAlreadyExists) {
            //                     this.sendUploadResponse(
            //                         `Mod with same ID and version already exists, replaced with ${wysmodReader.parsedFileData.metadata.name} v${wysmodReader.parsedFileData.metadata.version}`,
            //                         "warning"
            //                     );
            //                 } else {
            //                     this.sendUploadResponse(
            //                         `Successfully installed ${wysmodReader.parsedFileData.metadata.name} v${wysmodReader.parsedFileData.metadata.version}!`,
            //                         "success"
            //                     );
            //                 }
            //             } catch (err) {
            //                 this.sendUploadResponse(
            //                     `Install failed!<br>${err.message}`,
            //                     "danger"
            //                 );
            //             }
            //         })
            //         .catch((err) => {
            //             this.sendUploadResponse(
            //                 `Install failed!<br>${err.message}`,
            //                 "danger"
            //             );
            //         });
            //} else if (file.name.endsWith(".zip")) {
            if (file.name.endsWith(".zip")) {
                console.log("ZIP Upload");

                try {
                    const tempId = Buffer.from(
                        Date.now().toString(),
                        "utf8"
                    ).toString("base64url");

                    mkdirSync(`${this.appData}\\Temp\\${tempId}`);

                    const zip = new StreamZip.async({ file: file.path });

                    const count = await zip.extract(
                        null,
                        `${this.appData}\\Temp\\${tempId}`
                    );

                    await zip.close();

                    console.log(`Extracted ${count} items from zip`);

                    const modMetadata = glob.sync(
                        `${this.appData.replaceAll(
                            "\\",
                            "/"
                        )}/Temp/${tempId}/**/metadata.json`,
                        {}
                    );

                    if (modMetadata.length < 1)
                        throw new Error(
                            "No mod metadata found. Are you sure that this is a GMML mod?"
                        );

                    const modMetadataJSON = readJSONSync(modMetadata[0]);

                    if (modMetadataJSON.id === undefined)
                        throw new Error("No id!");

                    modMetadataJSON.enabled = true;
                    modMetadataJSON.isCoreMod = false;

                    writeJSONSync(
                        `${this.appData}\\Mod Info\\${modMetadataJSON.id}`,
                        modMetadataJSON
                    );

                    const modBinary = glob.sync(
                        `${this.appData.replaceAll(
                            "\\",
                            "/"
                        )}/Temp/${tempId}/**/*.dll`,
                        {}
                    );

                    if (modBinary.length < 1)
                        throw new Error(
                            "No mod binary found. Are you sure that this is a GMML mod?"
                        );

                    const header = readFileSync(modBinary[0])
                        .slice(0, 2)
                        .toString("utf8");

                    if (header !== "MZ")
                        throw new Error("Mod binary is not DLL");

                    copyFileSync(
                        modBinary[0],
                        `${this.appData}\\Mod Binaries\\${modMetadataJSON.id}`
                    );

                    const modDebugger = glob.sync(
                        `${this.appData.replaceAll(
                            "\\",
                            "/"
                        )}/Temp/${tempId}/**/*.pdb`,
                        {}
                    );

                    if (modDebugger.length > 0)
                        copyFileSync(
                            modDebugger[0],
                            `${this.appData}\\Mod Debuggers\\${modMetadataJSON.id}`
                        );

                    const modCover = glob.sync(
                        `${this.appData.replaceAll(
                            "\\",
                            "/"
                        )}/Temp/${tempId}/**/cover.png`,
                        {}
                    );

                    if (modCover.length > 0)
                        copyFileSync(
                            modCover[0],
                            `${this.appData}\\Mod Covers\\${modMetadataJSON.id}`
                        );

                    this.sendUploadResponse(
                        `Successfully installed ${modMetadataJSON.name} v${modMetadataJSON.version}!`,
                        "success"
                    );

                    rmSync(`${this.appData}\\Temp\\${tempId}`, {
                        recursive: true,
                    });
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

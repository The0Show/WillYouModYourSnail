const { ipcRenderer } = require("electron");
const { writeFileSync } = require("fs-extra");
const StreamZip = require("node-stream-zip");

class UploadPagePreloads {
    /**
     * eat mods
     */
    constructor() {
        document
            .getElementById("drop_zone")
            .addEventListener("drop", async (event) => {
                let alertPlaceholder =
                    document.getElementById("responseAlerts");

                function sendUploadResponse(message, type) {
                    let wrapper = document.createElement("div");
                    wrapper.innerHTML =
                        '<div class="alert alert-' +
                        type +
                        ' alert-dismissible" role="alert">' +
                        message +
                        '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';

                    alertPlaceholder.append(wrapper);
                }

                const file = event.dataTransfer.files[0];

                try {
                    if (file.name.endsWith(".wysmod")) {
                        const zip = new StreamZip.async({ file: file.path });

                        const modJSONBuffer = await zip.entryData("mod.json");
                        const modJSON = JSON.parse(
                            modJSONBuffer.toString("utf8")
                        );

                        const modPatchFile = await zip.entryData(
                            modJSON.patchFile
                        );

                        const appData = await ipcRenderer.invoke("appDataReq");

                        writeFileSync(
                            `${appData}\\ModManifests\\${modJSON.id}.json`,
                            modJSONBuffer
                        );
                        writeFileSync(
                            `${appData}\\ModPatches\\${modJSON.patchFile}`,
                            modPatchFile
                        );

                        sendUploadResponse(
                            `Mod <b>${modJSON.name}</b> installed successfully!`,
                            "success"
                        );
                    } else if (file.name.endsWith(".wysld")) {
                        sendUploadResponse(
                            `Successfully installed level <b>${file.name}</b>!`,
                            "success"
                        );
                    } else {
                        sendUploadResponse(
                            `Unsupported filetype<br>Please upload .wysmod or .wyslvl files`,
                            "danger"
                        );
                    }
                } catch (err) {
                    sendUploadResponse(
                        `Could not install due to ${err.name}:<br>${err.message}`,
                        "danger"
                    );
                }
            });
    }
}

module.exports = UploadPagePreloads;

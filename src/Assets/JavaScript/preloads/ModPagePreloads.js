const { ipcRenderer } = require("electron");
const {
    readdirSync,
    readJSONSync,
    writeJSONSync,
    removeSync,
    existsSync,
} = require("fs-extra");

class ModPagePreloads {
    /**
     * preloads for the mods page
     */
    constructor() {
        this.appData = "";

        ipcRenderer.invoke("appDataReq", []).then((res) => {
            this.appData = res;
            this.ListMods();
        });

        this.coreMods = ["com.github.benjaminpants.wys.snailax"];
    }

    /**
     * Registers the events (for the buttons, mostly)
     * @param {HTMLDivElement} element
     */
    RegisterEventsForModCard(element) {
        const deleteButton = element
            .getElementsByClassName("card-body")[0]
            .querySelector("[id='deleteButton']");

        const enableButton = element
            .getElementsByClassName("card-body")[0]
            .querySelector("[id='enableButton']");

        if (enableButton) {
            enableButton.addEventListener("click", () => {
                enableButton.disabled = true;
                enableButton.innerHTML = `<i class="fas fa-spinner fa-pulse"></i>`;

                const mod = readJSONSync(
                    `${this.appData}\\Mod Info\\${element.getAttribute(
                        "wys-modid"
                    )}`
                );

                mod.enabled = !mod.enabled;

                writeJSONSync(
                    `${this.appData}\\Mod Info\\${element.getAttribute(
                        "wys-modid"
                    )}`,
                    mod
                );

                enableButton.className = `btn btn-${
                    mod.enabled ? "primary" : "secondary"
                }`;
                enableButton.innerHTML = mod.enabled
                    ? '<i class="fas fa-toggle-on"></i> Disable'
                    : '<i class="fas fa-toggle-off"></i> Enable';

                enableButton.disabled = false;
            });
        }

        if (deleteButton) {
            deleteButton.addEventListener("click", () => {
                if (deleteButton.innerText !== " Are you sure?") {
                    deleteButton.innerHTML =
                        '<i class="fas fa-trash"></i> Are you sure?';
                } else {
                    deleteButton.innerHTML = `<i class="fas fa-spinner fa-pulse"></i>`;
                    deleteButton.disabled = true;

                    removeSync(
                        `${this.appData}\\Mod Info\\${element.getAttribute(
                            "wys-modid"
                        )}`
                    );
                    removeSync(
                        `${this.appData}\\Mod Binaries\\${element.getAttribute(
                            "wys-modid"
                        )}`
                    );
                    removeSync(
                        `${this.appData}\\Mod Covers\\${element.getAttribute(
                            "wys-modid"
                        )}`
                    );
                    removeSync(
                        `${this.appData}\\Mod Debuggers\\${element.getAttribute(
                            "wys-modid"
                        )}`
                    );

                    window.location.reload();
                }
            });

            deleteButton.addEventListener("focusout", () => {
                if (deleteButton.innerText !== "")
                    deleteButton.innerHTML =
                        '<i class="fas fa-trash"></i> Delete';
            });
        }
    }

    ListMods() {
        const modList = readdirSync(`${this.appData}\\Mod Info`);

        if (modList.length < 1) {
            document.getElementById("modList").innerHTML =
                "You don't have any mods installed.<br />No worries, click <a href='upload.html'>here</a> to install some!";
        }

        for (let index = 0; index < modList.length; index++) {
            const mod = readJSONSync(
                `${this.appData}\\Mod Info\\${modList[index]}`
            );

            if (
                existsSync(`${this.appData}\\Mod Binaries\\${modList[index]}`)
            ) {
                document.getElementById("modList").innerHTML += `<div
            class="card bg-dark text-white"
            style="overflow: hidden; position: relative; margin-left: 10px; margin-right: 10px"
            wys-modid="${mod.id}"
        >
            <img
                src="${
                    existsSync(`${this.appData}\\Mod Covers\\${modList[index]}`)
                        ? `${this.appData}\\Mod Covers\\${modList[index]}`
                        : "../Assets/Images/defaultModImage.png"
                }"
                class="card-img"
                style="
                    opacity: 0.6;
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: auto;
                "
            />
            <div
                class="card-body"
                style="text-align: right; position: relative"
            >
                <h5 class="card-title">${
                    mod.isCoreMod
                        ? '<span class="badge bg-primary">Core Mod</span> '
                        : `${
                              mod.id.startsWith("dllimport")
                                  ? '<span class="badge bg-primary">DLL</span> '
                                  : ""
                          }`
                }${mod.name}</h5>
                <p class="card-text">${
                    mod.description
                        ? mod.description
                        : `<i>${
                              mod.id.startsWith("dllimport")
                                  ? ""
                                  : "No description provided"
                          }</i>`
                }</p>
                <p class="card-text">
                    <small class="text-muted"
                        >v${mod.version} by ${
                    mod.id.startsWith("dllimport")
                        ? "a very cool person"
                        : mod.authors.join(", ")
                }</small
                    >
                </p>
                ${
                    !mod.isCoreMod
                        ? `<button type="button" class="btn btn-${
                              mod.enabled ? "primary" : "secondary"
                          }" id="enableButton">
                    ${
                        mod.enabled
                            ? '<i class="fas fa-toggle-on"></i> Disable'
                            : '<i class="fas fa-toggle-off"></i>  Enable'
                    }
                </button>
                <button type="button" class="btn btn-danger" id="deleteButton">
                    <i class="fas fa-trash"></i> Delete
                </button>`
                        : `<p>Core mods cannot be disabled or deleted.</p>`
                }
            </div>
        </div>
        <br />`;
            } else {
                document.getElementById("modList").innerHTML += `<div
            class="card bg-dark text-white"
            style="overflow: hidden; position: relative; margin-left: 10px; margin-right: 10px"
            wys-modid="${mod.id}"
        >
            <img
                src="../Assets/Images/defaultModImage.png"
                class="card-img"
                style="
                    opacity: 0.6;
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: auto;
                "
            />
            <div
                class="card-body"
                style="text-align: right; position: relative"
            >
                <h5 class="card-title"><i class="fas fa-exclamation-triangle"></i> ${mod.id}</h5>
                <p class="card-text">A mod config was found with the ID <code>${mod.id}</code>, but is missing a mod binary.<br />It will be removed on the next game launch unless fixed.</p>
                <button type="button" class="btn btn-danger" id="deleteButton">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
        <br />`;
            }
        }

        document
            .querySelectorAll("[wys-modid]")
            .forEach((element) => this.RegisterEventsForModCard(element));
    }
}

module.exports = ModPagePreloads;

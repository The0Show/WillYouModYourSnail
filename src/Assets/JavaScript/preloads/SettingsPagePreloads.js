const { ipcRenderer } = require("electron");
const {
    readdirSync,
    readFileSync,
    existsSync,
    readJSONSync,
} = require("fs-extra");

class SettingsPagePreloads {
    /**
     * preloads for the settings page
     */
    constructor() {
        this.buildSettingsPage();
        this.handleSmallText();
    }

    /**
     * Builds the settings page.
     */
    buildSettingsPage() {
        const settingsBuffer = readFileSync(
            `${__dirname}/../../JSON/Settings.json`
        );

        const settingsJSON = JSON.parse(settingsBuffer.toString());

        for (let index = 0; index < settingsJSON.length; index++) {
            const tab = settingsJSON[index];

            document.getElementById(
                "settingsTab"
            ).innerHTML += `<li class="nav-item" role="presentation">
            <button
                class="nav-link${index === 0 ? " active" : ""}"
                id="${tab.id}-tab"
                data-bs-toggle="tab"
                data-bs-target="#${tab.id}"
                type="button"
                role="tab"
                aria-controls="${tab.id}"
                aria-selected="true"
                wys-localizationkey="${tab.locakey}"
            >
                ${tab.name}
            </button>
        </li>`;

            document.getElementById("settingsTabContent").innerHTML += `<div
            class="tab-pane fade${index === 0 ? " show active" : ""}"
            id="${tab.id}"
            role="tabpanel"
            aria-labelledby="${tab.id}-tab"
            ></div>`;

            for (let index = 0; index < tab.settings.length; index++) {
                const setting = tab.settings[index];

                if (window.localStorage.getItem(setting.id) === null)
                    window.localStorage.setItem(setting.id, setting.default);

                switch (setting.type) {
                    case "toggle":
                        document.getElementById(
                            tab.id
                        ).innerHTML += `<div class="form-check">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            id="${setting.id}"
                            onchange="changeSetting(${setting.id})"
                            ${
                                window.localStorage.getItem(setting.id) ===
                                "true"
                                    ? "checked"
                                    : ""
                            }
                            ${setting.disabled === true ? "disabled" : ""}
                        />
                        <label class="form-check-label" for="${setting.id}" 
                        wys-localizationkey="${setting.locakey}">
                            ${setting.name}
                        </label>
                    </div>`;
                        break;

                    case "select":
                        document.getElementById(
                            tab.id
                        ).innerHTML += `<div class="form-floating">
                                <select
                                    class="form-select"
                                    id="${setting.id}"
                                    aria-label="${setting.name}"
                                    onchange="changeSetting(${setting.id})"
                                    ${
                                        setting.disabled === true
                                            ? "disabled"
                                            : ""
                                    }
                                ></select>
                                <label for="${
                                    setting.id
                                }" wys-localizationkey="${setting.locakey}"
                                    >${setting.name}</label
                                >
                            </div>`;

                        setting.options.forEach(
                            (option) =>
                                (document.getElementById(
                                    setting.id
                                ).innerHTML += `<option value="${
                                    option.value
                                }"${
                                    window.localStorage.getItem(setting.id) ===
                                    option.value
                                        ? " selected"
                                        : ""
                                } wys-localizationkey="${option.locakey}">${
                                    option.name
                                }</option>`)
                        );
                        break;

                    case "textInput":
                        document.getElementById(
                            tab.id
                        ).innerHTML += `<div class="mb-3">
                        <label for="${setting.id}" class="form-label" 
                        wys-localizationkey="${setting.locakey}">${
                            setting.name
                        }</label>
                        <input type="text"
                        class="form-control"
                        id="${setting.id}"
                        placeholder="${setting.default}"
                        onchange="changeSetting(${setting.id})"
                        value="${window.localStorage.getItem(setting.id)}"
                        ${setting.disabled === true ? "disabled" : ""}>
                      </div>`;
                        break;

                    default:
                        break;
                }

                if (setting.type !== "toggle")
                    document.getElementById(tab.id).innerHTML += "<br />";
            }
        }
        this.localizeInnerText();
        this.prepareColorSchemeToggle();
        this.liveUpdates();
    }

    /**
     * Prepares the color scheme dropdown.
     */
    prepareColorSchemeToggle() {
        const colorSchemes = readdirSync(
            `${window.localStorage.getItem("gameDir")}/Colors`
        );

        const languageFile = readJSONSync(
            `${__dirname}/../../JSON/Localization/${window.localStorage.getItem(
                "localization"
            )}.json`
        );

        for (let index = 0; index < colorSchemes.length; index++) {
            const scheme = colorSchemes[index];

            document.getElementById(
                "colorPreset"
            ).innerHTML += `<option value="${scheme}"${
                window.localStorage.getItem("colorPreset") === scheme
                    ? " selected"
                    : ""
            }>${
                languageFile["settings.looks.colors.prefix"]
            } ${scheme}</option>`;
        }
    }

    // do this after building
    localizeInnerText() {
        const nodesToLocalize = document.querySelectorAll(
            "[wys-localizationkey]"
        );

        if (
            !existsSync(
                `${__dirname}/../../JSON/Localization/${window.localStorage.getItem(
                    "localization"
                )}.json`
            )
        )
            return console.error(
                `Localization file for ${window.localStorage.getItem(
                    "localization"
                )} not found`
            );

        const languageFile = readJSONSync(
            `${__dirname}/../../JSON/Localization/${window.localStorage.getItem(
                "localization"
            )}.json`
        );

        for (let index = 0; index < nodesToLocalize.length; index++) {
            const node = nodesToLocalize[index];

            if (!languageFile[node.getAttribute("wys-localizationkey")])
                continue;

            node.innerHTML =
                languageFile[node.getAttribute("wys-localizationkey")];
        }

        document.title = languageFile["window.title"];
    }

    /**
     * Changes settings live.
     */
    liveUpdates() {
        document
            .getElementById("localization")
            .addEventListener("input", () => {
                setTimeout(() => this.localizeInnerText(), 100);
            });
    }

    handleSmallText() {
        ipcRenderer.invoke("getVersion", []).then((res) => {
            document.querySelector(
                "small"
            ).innerText = `v${res} • © 2022 The0Show and Contributors`;
        });

        document.querySelector("small").addEventListener("click", () => {
            document.getElementById("creditsModalOpener").click();
        });
    }
}

module.exports = SettingsPagePreloads;

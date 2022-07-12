const { default: axios } = require("axios");
const { readJSONSync } = require("fs-extra");
const { existsSync } = require("original-fs");

class OnboardingPrelaods {
    /**
     * preloads for the mods page
     */
    constructor() {
        this.addLanguageOptions();
        this.liveUpdates();
    }

    /**
     * Adds the language options to the dropdown.
     */
    addLanguageOptions() {
        const settingsJSON = readJSONSync(
            `${__dirname}/../../JSON/Settings.json`
        );

        settingsJSON.forEach((tab) => {
            tab.settings.forEach((setting) => {
                if (window.localStorage.getItem(setting.id) === null)
                    window.localStorage.setItem(setting.id, setting.default);
            });
        });

        settingsJSON[0].settings[0].options.forEach(
            (option) =>
                (document.getElementById(
                    "localization"
                ).innerHTML += `<option value="${option.value}"${
                    option.value === "en_US" ? " selected" : ""
                } wys-localizationkey="${option.locakey}">${
                    option.name
                }</option>`)
        );
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
    }

    liveUpdates() {
        document
            .getElementById("localization")
            .addEventListener("input", () => {
                setTimeout(() => this.localizeInnerText(), 100);
            });

        document.getElementById("gameDir").addEventListener("input", () => {
            window.localStorage.setItem(
                "gameDir",
                document
                    .getElementById("gameDir")
                    .files[0].path.replace("\\Will You Snail.exe", "")
            );
        });
    }

    async installGMML() {
        const runId = await axios
            .get(
                "https://api.github.com/repos/cgytrus/gmml/actions/workflows/26995926/runs"
            )
            .then((res) => res.data.workflow_runs[0].id);

        const artifacts = await axios
            .get(
                `https://api.github.com/repos/cgytrus/gmml/actions/runs/${runId}/artifacts`
            )
            .then((res) => res.data.artifacts);
    }
}

module.exports = OnboardingPrelaods;

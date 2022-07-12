const { existsSync, readJSONSync } = require("fs-extra");

class GlobalPreload {
    /**
     * preloads that should be  e v e r y w h e r e
     */
    constructor() {
        if (!window.location.href.includes("onboarding")) this.injectHeader();
        this.injectModals();
        this.localizeInnerText();
        this.setupDefaultSettingValuesIfNeeded();
    }

    /**
     * Injects the header into the `body`.
     */
    injectHeader() {
        const headerPages = [
            ["Mods", "header.mods", "fa-puzzle-piece", "mods.html"],
            ["Levels", "header.levels", "fa-ruler-combined", "levels.html"],
            ["Upload", "header.upload", "fa-upload", "upload.html"],
            ["Browse", "header.browse", "fa-search", "browse.html"],
            ["Tools", "header.tools", "fa-wrench", "tools.html"],
            ["Settings", "header.settings", "fa-cog", "settings.html"],
        ];
        let headerPageString = "";

        for (let index = 0; index < headerPages.length; index++) {
            const page = headerPages[index];
            headerPageString += `<a class="nav-link${
                window.location.href.includes(page[3])
                    ? ' active" aria-current="page"'
                    : '"'
            } href="${page[3]}" ><i class="fas ${
                page[2]
            }"></i> <blank wys-localizationkey="${page[1]}">${
                page[0]
            }</blank></a>`;
        }

        document.body.innerHTML = `
        <nav class="navbar sticky-top navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="mods.html">
                <img
                    src="../Assets/Images/Snail.png"
                    alt=""
                    width="48"
                    height="48"
                />
            </a>
            <button type="button" id="launchButton" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#myAmazingModal">
                <i class="fas fa-play"></i> <blank wys-localizationkey="header.playbutton">Launch Will You Snail</blank>
            </button>
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNavAltMarkup"
                aria-controls="navbarNavAltMarkup"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav">
                    ${headerPageString}
                </div>
            </div>
        </div>
    </nav>
    <br />${document.body.innerHTML}`;
    }

    injectModals() {
        const modals = [
            {
                id: "myAmazingModal",
                label: "My Amazing Modal",
                body: "body",
                footer: '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button><button type="button" class="btn btn-primary">Understood</button>',
                hasCloseIcon: true,
            },
        ];

        for (let index = 0; index < modals.length; index++) {
            const modal = modals[index];

            document.body.innerHTML += `<div class="modal fade" id="${
                modal.id
            }" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="${
                modal.id
            }Label" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title" id="${
                modal.id
            }Label">Modal title</h5>${
                modal.hasCloseIcon
                    ? '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'
                    : ""
            }</div>
            <div class="modal-body">${modal.body}</div>
            <div class="modal-footer">${modal.footer}</div>
          </div>
        </div>
      </div>`;
        }
    }

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

    setupDefaultSettingValuesIfNeeded() {
        window.localStorage.getItem("");
    }
}

module.exports = GlobalPreload;

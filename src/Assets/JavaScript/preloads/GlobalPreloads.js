const { ipcRenderer, shell } = require("electron");
const {
	existsSync,
	readJSONSync,
	readdirSync,
	emptyDirSync,
	readFileSync,
	copyFile,
	createReadStream,
	createWriteStream,
	mkdirSync,
	writeFileSync,
} = require("fs-extra");
const { decompress, createDecompressor } = require("lzma-native");
const wait = require("util").promisify(setTimeout);

class GlobalPreload {
	/**
	 * preloads that should be  e v e r y w h e r e
	 */
	constructor() {
		if (
			!window.location.href.includes("onboarding") &&
			!window.location.href.includes("init")
		)
			this.injectHeader();
		this.injectModals();
		this.localizeInnerText();
		this.setupDefaultSettingValuesIfNeeded();
		ipcRenderer.invoke("appDataReq", []).then((res) => {
			this.appData = res;
			this.dealWithTheAnnoyingLaunchButton();
		});
	}

	/**
	 * Injects the header into the `body`.
	 */
	async injectHeader() {
		const headerPages = [
			["Mods", "header.mods", "fa-puzzle-piece", "mods.html"],
			//["Levels", "header.levels", "fa-ruler-combined", "levels.html"],
			["Upload", "header.upload", "fa-upload", "upload.html"],
			//["Browse", "header.browse", "fa-search", "browse.html"],
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
			}"></i> <blank wys-localizationkey="${page[1]}">${page[0]}</blank></a>`;
		}

		document.body.innerHTML = `
        </div>      
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
            <button type="button" id="launchButton" class="btn btn-primary">
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
        <!-- this "hack" centers the text under the main header content
        <div class="container-fluid"><p></p><div class="alert alert-primary fade show" role="alert">
        Will You Mod Your Snail has downloaded an update. It will be installed once it is closed.
      </div><p></p></div> -->
    </nav>
    <br />${document.body.innerHTML}`;
	}

	injectModals() {
		const modals = [
			{
				id: "cannotLaunchDueToMisconfiguration",
				label: "Cannot launch Will You Snail",
				body: "Misconfigured mods were found. Please fix or remove them before launching.",
				footer: "",
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
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
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
		const nodesToLocalize = document.querySelectorAll("[wys-localizationkey]");

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

			if (!languageFile[node.getAttribute("wys-localizationkey")]) continue;

			node.innerHTML = languageFile[node.getAttribute("wys-localizationkey")];
		}

		document.title = languageFile["window.title"];
	}

	setupDefaultSettingValuesIfNeeded() {
		window.localStorage.getItem("");
	}

	dealWithTheAnnoyingLaunchButton() {
		const launchButton = document.getElementById("launchButton");

		launchButton.addEventListener("click", async () => {
			launchButton.disabled = true;
			launchButton.innerHTML =
				'<i class="fas fa-spinner fa-pulse"></i> Getting ready...';

			document.getElementsByClassName("navbar-toggler")[0].disabled = true;
			document.getElementsByClassName("navbar-nav")[0].hidden = true;
			document.getElementsByClassName("navbar-brand")[0].href = "#";

			const modList = readdirSync(`${this.appData}\\Mod Info`);

			emptyDirSync(`${window.localStorage.getItem("gameDir")}\\gmml\\mods`);

			var totalMods = modList.length;
			var proccessedMods = 0;

			for (let index = 0; index < modList.length; index++) {
				const mod = modList[index];

				console.debug(readJSONSync(`${this.appData}\\Mod Info\\${mod}`));

				if (!readJSONSync(`${this.appData}\\Mod Info\\${mod}`).enabled) {
					console.log(`Mod ${mod} is disabled, skipping`);
					totalMods -= 1;
					continue;
				}

				try {
					console.log(`Processing mod ${mod} ${index + 1}/${modList.length}`);
					launchButton.innerHTML = `<i class="fas fa-spinner fa-pulse"></i> Processing mod ${mod} ${
						index + 1
					}/${modList.length}`;

					const modFile = readFileSync(`${this.appData}\\Mod Binaries\\${mod}`);

					mkdirSync(
						`${window.localStorage.getItem("gameDir")}\\gmml\\mods\\${mod}`
					);

					if (modFile.slice(0, 2).toString("utf8") === "MZ") {
						console.debug(`Using DLL load sequence`);
						console.debug(
							`${
								this.appData
							}\\Mod Binaries\\${mod} -> ${window.localStorage.getItem(
								"gameDir"
							)}\\gmml\\mods\\${mod}\\${mod}.dll`
						);
						copyFile(
							`${this.appData}\\Mod Binaries\\${mod}`,
							`${window.localStorage.getItem(
								"gameDir"
							)}\\gmml\\mods\\${mod}\\${mod}.dll`
						);
					} else {
						const decompressor = createDecompressor();
						const input = createReadStream(
							`${this.appData}\\Mod Binaries\\${mod}`
						);
						const output = createWriteStream(
							`${window.localStorage.getItem(
								"gameDir"
							)}\\gmml\\mods\\${mod}\\${mod}.dll`
						);

						input.pipe(decompressor).pipe(output);
					}

					copyFile(
						`${this.appData}\\Mod Info\\${mod}`,
						`${window.localStorage.getItem(
							"gameDir"
						)}\\gmml\\mods\\${mod}\\metadata.json`
					);
					console.debug(
						`${this.appData}\\Mod Info\\${mod} -> ${window.localStorage.getItem(
							"gameDir"
						)}\\gmml\\mods\\${mod}\\metadata.json`
					);

					if (existsSync(`${this.appData}\\Mod Debuggers\\${mod}`)) {
						copyFile(
							`${this.appData}\\Mod Debuggers\\${mod}`,
							`${window.localStorage.getItem(
								"gameDir"
							)}\\gmml\\mods\\${mod}\\${mod}.pdb`
						);
					}
					console.debug(
						`${
							this.appData
						}\\Mod Debuggers\\${mod} -> ${window.localStorage.getItem(
							"gameDir"
						)}\\gmml\\mods\\${mod}\\${mod}.pdb`
					);

					proccessedMods++;
					console.log(`Successfully processed ${mod}`);
				} catch (err) {
					console.error(`Failed to process ${mod}`);
					console.error(err);
				}
			}

			launchButton.innerHTML =
				'<i class="fas fa-spinner fa-pulse"></i> Applying GMML config...';

			var gmmlConfig = "";
			if (window.localStorage.getItem("gmmlConsoleToggle") === "true")
				gmmlConfig += "\nconsole";
			if (window.localStorage.getItem("gmmlDebugToggle") === "true")
				gmmlConfig += "\ndebug";

			console.debug("New GMML Config:");
			console.debug(gmmlConfig);
			console.debug(
				`Writing to ${window.localStorage.getItem("gameDir")}\\gmml.cfg`
			);

			writeFileSync(
				`${window.localStorage.getItem("gameDir")}\\gmml.cfg`,
				gmmlConfig.replace("\n", "")
			);

			document.getElementsByClassName("navbar-toggler")[0].disabled = false;
			document.getElementsByClassName("navbar-nav")[0].hidden = false;
			document.getElementsByClassName("navbar-brand")[0].href = "mods.html";

			if (proccessedMods / totalMods === 1)
				launchButton.className = "btn btn-success";
			if (proccessedMods / totalMods < 1 && proccessedMods / totalMods > 0)
				launchButton.className = "btn btn-warning";
			if (proccessedMods / totalMods === 0)
				launchButton.className = "btn btn-danger";

			console.log(`${Math.round((proccessedMods / totalMods) * 100)}% pass`);

			launchButton.innerHTML = `Successfully processed ${Math.round(
				(proccessedMods / totalMods) * 100
			)}% of installed mods`;
			if (totalMods === 0)
				launchButton.innerHTML = `No mods found - launching without any mods`;

			console.log("Starting game through Steam");
			shell.openExternal("steam://launch/1115050");

			setTimeout(() => {
				launchButton.className = "btn btn-primary";
				launchButton.disabled = false;
				launchButton.innerHTML = `<i class="fas fa-play"></i> <blank wys-localizationkey="header.playbutton">${
					readJSONSync(
						`${__dirname}/../../JSON/Localization/${window.localStorage.getItem(
							"localization"
						)}.json`
					)["header.playbutton"]
				}</blank>`;
			}, 5000);
		});
	}
}

module.exports = GlobalPreload;

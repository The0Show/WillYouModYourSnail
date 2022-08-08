const { ipcRenderer } = require("electron");
const { emptyDir, emptyDirSync } = require("fs-extra");

class ToolsPagePreloads {
	constructor() {
		this.appData = "";

		ipcRenderer.invoke("appDataReq", []).then((res) => {
			this.appData = res;
		});

		this.loadTools();
	}

	loadTools() {
		const tools = [
			{
				name: "Verify integrity of game files",
				desc: "Reinstalls any game files that don't match with Steam's servers. Your save files and mods will remain intact.",
				callback: () => {
					window.location.href = "steam://validate/1115050";
				},
			},
			{
				name: "Uninstall Modded Will You Snail",
				desc: 'Clears the Will You Snail directory, reinstalls the game, and clears the "gameDir" setting. Your save files will remain intact.',
				callback: () => {
					emptyDir(window.localStorage.getItem("gameDir"), () => {
						window.location.href = "steam://validate/1115050";
						window.localStorage.removeItem("gameDir");
						window.close();
					});
				},
			},
			{
				name: "Uninstall Mods",
				desc: "Uninstalls all mods.",
				callback: () => {
					emptyDirSync(`${this.appData}\\Mod Info`);
					emptyDirSync(`${this.appData}\\Mod Binaries`);
					emptyDirSync(`${this.appData}\\Mod Covers`);
					emptyDirSync(`${this.appData}\\Mod Debuggers`);
				},
			},
		];

		function sortArray(x, y) {
			if (x.name < y.name) {
				return -1;
			}
			if (x.name > y.name) {
				return 1;
			}
			return 0;
		}

		const sortedTools = tools.sort(sortArray);

		for (let index = 0; index < sortedTools.length; index++) {
			const tool = sortedTools[index];

			let option = document.createElement("button");
			option.type = "button";
			option.className = "btn btn-danger";
			option.innerText = tool.name;
			option.title = tool.desc;
			option.value = index;

			document.getElementById("buttonRow").append(option);
		}

		document.getElementById("buttonRow").childNodes.forEach((button) => {
			button.addEventListener("click", () => {
				sortedTools[parseInt(button.value)].callback();

				button.className = "btn btn-success";

				setTimeout(() => {
					button.className = "btn btn-danger";
				}, 1000);
			});
		});
	}
}

module.exports = ToolsPagePreloads;

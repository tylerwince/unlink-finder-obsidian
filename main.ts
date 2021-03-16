import { App, Modal, Notice, Plugin, PluginSettingTab, Setting, SettingTab } from 'obsidian';

interface UnlinkFinderSettings {
	mySetting: string;
	highlightsInEditor: boolean;
	highlightsInPreview: boolean;
	minimumMatchCharacters: number;
	showLegend: boolean;
}

const DEFAULT_SETTINGS: UnlinkFinderSettings = {
	mySetting: 'default',
	highlightsInEditor: false,
	highlightsInPreview: true,
	minimumMatchCharacters: 5,
	showLegend: true,
}

export default class UnlinkFinder extends Plugin {
	settings: UnlinkFinderSettings;
	public statusBar: HTMLElement;
	async onload() {

		await this.loadSettings();

		let unlinkFinderActive = false;

		this.addRibbonIcon("cross-in-box", "Unlink Finder", () => {
			unlinkFinderActive = !unlinkFinderActive;
			this.statusBar.setText(`Unlink Finder: ${unlinkFinderActive ? 'On' : 'Off'}`);
			new Notice("You've activated Unlink Finder!");
		});

		this.statusBar = this.addStatusBarItem();
		this.statusBar.setText(`Unlink Finder: ${unlinkFinderActive ? 'On' : 'Off'}`);

		this.addCommand({
			id: "activate-unlink-finder",
			name: "Activate Unlink Finder",
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						unlinkFinderActive = !unlinkFinderActive;

						this.statusBar.setText(`Unlink Finder: ${unlinkFinderActive ? 'On' : 'Off'}`);
						new Notice("You've activated Unlink Finder!");
					}
					return true;
				}
				return false;
			}
		});

		this.addSettingTab(new UnlinkFinderSettingsTab(this.app, this));

		this.registerCodeMirror((cm: CodeMirror.Editor) => {
			console.log("Unlink Finder CodeMirror", cm);
		});

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000));
	}

	onunload() {
		console.log("Unlink Finder unloading");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class UnlinkFinderSettingsTab extends PluginSettingTab {
	plugin: UnlinkFinder;

	constructor(app: App, plugin: UnlinkFinder) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Unlink Finder Settings" });

		new Setting(containerEl)
			.setName("Show in Editor Mode")
			.setDesc("Highlight page matches in editor mode.")
			.addToggle(toggle => toggle.setValue(this.plugin.settings.highlightsInEditor)
				.onChange((value) => {
					this.plugin.settings.highlightsInEditor = value;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Show in Preview Mode")
			.setDesc("Highlight page matches in preview mode.")
			.addToggle(toggle => toggle.setValue(this.plugin.settings.highlightsInPreview)
				.onChange((value) => {
					this.plugin.settings.highlightsInPreview = value;
					this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Minimum Characters")
			.setDesc("Minimum page name length to be considered in the matching algorithm.")
			.addSlider(slider => slider
				.setLimits(0, 15, 1)
				.setValue(this.plugin.settings.minimumMatchCharacters)
				.onChange((value) => {
					this.plugin.settings.minimumMatchCharacters = value;
					this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Show Match Type Legend")
			.setDesc("Show a legend of the different match types in the status bar.")
			.addToggle(toggle => toggle.setValue(this.plugin.settings.showLegend)
				.onChange((value) => {
					this.plugin.settings.showLegend = value;
					this.plugin.saveSettings();
				})
			);
	}

}

import path from "node:path";
import { BrowserWindow, Tray, ipcMain, shell } from "electron";
import icon from "../../resources/IconTemplate@2x.png?asset";

export type TrendType =
	| "SingleDown"
	| "FortyFiveDown"
	| "Flat"
	| "FortyFiveUp"
	| "SingleUp"
	| "NotComputable";

const MAP_TREND_TO_ARROW = {
	SingleDown: "\u2193",
	FortyFiveDown: "\u2198",
	Flat: "\u2192",
	FortyFiveUp: "\u2197",
	SingleUp: "\u2191",
	NotComputable: "?",
};

type LibreCgmData = {
	value: number;
	is_high: boolean;
	is_low: boolean;
	trend: TrendType;
	date: Date;
};

function createPopup() {
	const popup = new BrowserWindow({
		width: 360,
		height: 640,
		show: false,
		transparent: true,
		frame: false,
		movable: false,
		alwaysOnTop: true,
		minimizable: false,
		maximizable: false,
		webPreferences: {
			preload: path.join(__dirname, "../preload/index.js"),
		},
	});

	popup.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});
	popup.loadURL("https://naomisugar.vercel.app");
	return popup;
}

export default class App {
	private popup: BrowserWindow;
	private tray: Tray;
	private lastAlert: LibreCgmData | undefined;
	constructor() {
		this.popup = createPopup();

		this.tray = new Tray(icon);
		this.tray.setIgnoreDoubleClickEvents(true);
		this.tray.on("click", this.toggleWindow);

		this.listenToSugar();
	}

	getWindowPosition = () => {
		const windowBounds = this.popup.getBounds();
		const trayBounds = this.tray.getBounds();
		const x = Math.round(
			trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
		);
		const y = Math.round(trayBounds.y + trayBounds.height);
		return { x, y };
	};
	showWindow = (size = "big") => {
		if (this.popup.isVisible()) return;
		const position = this.getWindowPosition();
		this.popup.setPosition(position.x, position.y, false);
		this.popup.setSize(360, size === "small" ? 160 : 640);
		this.popup.show();
		this.popup.setVisibleOnAllWorkspaces(true);
		this.popup.focus();
		this.popup.setVisibleOnAllWorkspaces(false);
	};

	toggleWindow = () => {
		if (this.popup.isVisible()) {
			this.popup.hide();
		} else {
			this.showWindow("big");
		}
	};

	listenToSugar = () => {
		ipcMain.handle("libreData", (event, data) => {
			const current = data.current as LibreCgmData;
			if (current?.value) {
				this.tray.setTitle(
					`${current.value.toFixed(1)} ${MAP_TREND_TO_ARROW[current.trend]}`,
				);

				if (this.lastAlert) {
					if (
						+current.date - +this.lastAlert.date < 60 * 60 * 1000 ||
						Math.abs(current.value - this.lastAlert.value) > 2
					) {
						this.alert(current);
					}
				} else {
					this.lastAlert = current;
				}
			}
		});
	};

	alert(current) {
		this.lastAlert = current;
		this.showWindow("small");
		setTimeout(() => {
			this.popup.hide();
		}, 1000);
	}
}

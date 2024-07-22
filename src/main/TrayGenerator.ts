import { type BrowserWindow, Menu, Tray } from "electron";
import icon from "../../resources/IconTemplate.png?asset";

class TrayGenerator {
	private tray: Tray;
	private mainWindow: BrowserWindow;
	constructor(mainWindow) {
		this.mainWindow = mainWindow;

		this.tray = new Tray(icon);
		this.tray.setIgnoreDoubleClickEvents(true);
		this.tray.on("click", this.toggleWindow);
	}
	getWindowPosition = () => {
		const windowBounds = this.mainWindow.getBounds();
		const trayBounds = this.tray.getBounds();
		const x = Math.round(
			trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
		);
		const y = Math.round(trayBounds.y + trayBounds.height);
		return { x, y };
	};
	showWindow = () => {
		const position = this.getWindowPosition();
		this.mainWindow.setPosition(position.x, position.y, false);
		this.mainWindow.show();
		this.mainWindow.setVisibleOnAllWorkspaces(true);
		this.mainWindow.focus();
		this.mainWindow.setVisibleOnAllWorkspaces(false);
		this.mainWindow.setOpacity(0.8);
	};
	toggleWindow = () => {
		if (this.mainWindow.isVisible()) {
			this.mainWindow.hide();
		} else {
			this.showWindow();
		}
	};
}
export default TrayGenerator;

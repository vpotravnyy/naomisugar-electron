import { join } from "node:path";
import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import { BrowserWindow, Tray, app, ipcMain, shell } from "electron";
import TrayWindow from "electron-tray-window";
import trayicon from "../../resources/IconTemplate.png?asset";
import icon from "../../resources/icon.png?asset";
import TrayGenerator from "./TrayGenerator";

let mainWindow: BrowserWindow;

function createWindow(): void {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 360,
		height: 640,
		show: false,
		transparent: true,
		frame: false,
		movable: false,
		minimizable: false,
		alwaysOnTop: true,
		skipTaskbar: true,
		maximizable: false,
		autoHideMenuBar: true,
		...(process.platform === "linux" ? { icon } : {}),
		webPreferences: {
			preload: join(__dirname, "../preload/index.js"),
			sandbox: false,
		},
	});

	// mainWindow.on("ready-to-show", () => {
	// 	mainWindow.show();
	// });

	mainWindow.webContents.setWindowOpenHandler((details) => {
		shell.openExternal(details.url);
		return { action: "deny" };
	});
	mainWindow.loadURL("https://naomisugar.vercel.app");
	// HMR for renderer base on electron-vite cli.
	// Load the remote URL for development or the local html file for production.
	// if (is.dev && process.env.ELECTRON_RENDERER_URL) {
	// 	mainWindow.loadURL("https://naomisugar.vercel.app");
	// } else {
	// 	mainWindow.loadFile(join(__dirname, "https://naomisugar.vercel.app"));
	// }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	// Default open or close DevTools by F12 in development
	// and ignore CommandOrControl + R in production.
	// see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
	app.on("browser-window-created", (_, window) => {
		optimizer.watchWindowShortcuts(window);
	});

	// IPC test
	ipcMain.on("ping", () => console.log("pong"));

	createWindow();
	const Tray = new TrayGenerator(mainWindow);
	// const tray = new Tray(trayicon);
	// TrayWindow.setOptions({ tray: tray, window: mainWindow });

	app.on("activate", () => {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.dock.hide();
// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

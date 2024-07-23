import { electronApp } from "@electron-toolkit/utils";
import { app } from "electron";
import App from "./App";

app.whenReady().then(() => {
	// Set app user model id for windows
	electronApp.setAppUserModelId("com.electron");

	new App();
});

app.dock.hide();

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPIs", {
	libreData: (data) => ipcRenderer.invoke("libreData", data),
});

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("lagzero", {
  version: "0.1.0"
});


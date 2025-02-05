import { net, app, protocol } from "electron";
import * as url from "node:url";
import {Depot} from "./depot";


export function register(depot: Depot) {
    protocol.registerSchemesAsPrivileged([
        {
            scheme: "nyquist",
            privileges: {
                standard: true,
                secure: true,
                supportFetchAPI: true,
                corsEnabled: false,
                bypassCSP: true,
                stream: true,
            },
        },
    ]);


    void app.whenReady().then(() => {
        console.log("Skibidi-maxxing...")
        protocol.handle("nyquist", async (req) => {
            if (req.url.startsWith("nyquist://depot/")) {
                const depotId = req.url.replace("nyquist://depot/", "");
                const item = depot.getDepotItem(depotId);
                
                if (item) {
                    if (item.type === 'path') {
                        return net.fetch(url.pathToFileURL(item.data as string).href);
                    } else if (item.type === 'blob') {
                        const imageData = item.data as { data: number[], format: string };
                        const blob = new Blob([new Uint8Array(imageData.data)], { type: imageData.format });
                        return new Response(blob);
                    }
                }
                
                return new Response("Resource not found", {
                    status: 404,
                    headers: {"content-type": "text/plain"},
                });
            }
            return new Response("Invalid URL", {
                status: 400,
                headers: {"content-type": "text/plain"},
            });
        });
    });
}
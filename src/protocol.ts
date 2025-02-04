import path from "node:path";
import Url from "node:url";
import { net, app, protocol } from "electron";
protocol.registerSchemesAsPrivileged([
    {
        scheme: "legcord",
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

var depot: Map<string, string> = new Map();
function depotAdd(url: string) {
    depot.set(url, );
}

void app.whenReady().then(() => {
    protocol.handle("nyquist", (req) => {
        if (req.url.startsWith("nyquist://depot/")) {
            const url = req.url.replace("legcord://plugins/", "").split("/");
            const filePath = path.join(import.meta.dirname, "plugins", `/${url[0]}/${url[1]}`);
            if (filePath.includes("..")) {
                return new Response("bad", {
                    status: 400,
                    headers: { "content-type": "text/html" },
                });
            }
            return net.fetch(Url.pathToFileURL(filePath).toString());
        }
        return new Response("bad", {
            status: 400,
            headers: { "content-type": "text/html" },
        });
    });
});
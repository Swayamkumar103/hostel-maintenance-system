import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";

export function resolve(specifier, context, nextResolve) {
    let target = specifier;

    if (specifier.startsWith("next/")) {
        return nextResolve(specifier + ".js", context);
    }

    if (specifier.startsWith("@/")) {
        const subPath = specifier.slice(2);
        const basePath = path.resolve(process.cwd(), "src", subPath);
        if (fs.existsSync(basePath + ".js")) {
            target = pathToFileURL(basePath + ".js").href;
        } else if (fs.existsSync(path.join(basePath, "index.js"))) {
            target = pathToFileURL(path.join(basePath, "index.js")).href;
        } else if (fs.existsSync(basePath)) {
            target = pathToFileURL(basePath).href;
        } else {
            target = pathToFileURL(basePath + ".js").href;
        }
    } else if (specifier.startsWith("./") || specifier.startsWith("../")) {
        if (context.parentURL) {
            const parentDir = path.dirname(new URL(context.parentURL).pathname.replace(/^\/([A-Z]:)/, "$1"));
            const candidate = path.resolve(parentDir, specifier);
            if (!fs.existsSync(candidate) && fs.existsSync(candidate + ".js")) {
                target = pathToFileURL(candidate + ".js").href;
            }
        }
    }

    return nextResolve(target, context);
}

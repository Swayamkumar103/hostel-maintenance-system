import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./scripts/module-resolver.mjs", pathToFileURL("./"));

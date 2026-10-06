// Copies MapLibre's CSP worker into /public so it is served from our own origin
// (keeps the Content-Security-Policy strict: worker-src 'self', no blob: workers).
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const src = join(dirname(require.resolve("maplibre-gl/package.json")), "dist", "maplibre-gl-csp-worker.js");
mkdirSync("public/vendor", { recursive: true });
copyFileSync(src, "public/vendor/maplibre-gl-csp-worker.js");
console.log("maplibre worker → public/vendor/maplibre-gl-csp-worker.js");

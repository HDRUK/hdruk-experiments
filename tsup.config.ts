import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { defineConfig } from "tsup";

const SERVER_SAFE_ENTRIES = { index: "src/index.ts" };
const CLIENT_ENTRIES = {
    client: "src/client.ts",
    builder: "src/builder.ts",
};

export default defineConfig({
    entry: { ...SERVER_SAFE_ENTRIES, ...CLIENT_ENTRIES },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    external: [
        "react",
        "react-dom",
        /^@mui\//,
        /^@emotion\//,
        /^@tiptap\//,
        /^@dnd-kit\//,
        /^@hdruk\//,
    ],
    // Prepended here rather than via `banner`, which the treeshake pass
    // strips. The yalc push lives here too: a CLI --onSuccess would replace
    // this hook and drop the banner.
    onSuccess: async () => {
        for (const name of Object.keys(CLIENT_ENTRIES)) {
            for (const ext of ["js", "cjs"]) {
                const full = resolve(`dist/${name}.${ext}`);
                const content = readFileSync(full, "utf8");
                if (!content.startsWith('"use client"')) {
                    writeFileSync(full, `"use client";\n${content}`);
                }
            }
        }
        if (process.env.YALC_PUSH) {
            execSync("npx --no-install yalc push --no-scripts", {
                stdio: "inherit",
            });
        }
    },
});

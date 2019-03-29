#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const emoji = require("node-emoji");
const { green } = require("kleur");
const Manifest = require("@slimio/manifest");

// Constants
const pathMainDir = process.cwd();
const requiredFiles = require("../src/requiredFiles.json");
const msg = require("../src/messages.js");
const requiredDir = new Set(["src", "test", "benchmark", "docs"]);
const excludeFiles = new Set(["package.json", "LICENSE"]);
const E_SEV = Object.freeze({
    CRIT: ":no_entry:",
    WARN: ":warning",
    INFO: ":bulb:"
});

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @param MainDir Constant pathMainDir
 * @returns {Console}
 */

function log(severity, message, file) {
    // Messages in console
    if (file === undefined) {
        console.log("|", emoji.get(severity), " :", message);
    }
    else {
        console.log("|", emoji.get(severity), " :", green(file), message);
    }
    if (severity === E_SEV.CRIT) {
        process.exit(1);
    }
}

async function main(MainDir) {
    // Read the main directory of user
    const elemMainDir = new Set(await readdir(MainDir));

    // Loop on required files array
    for (const file of requiredFiles) {
        // If file exist
        if (elemMainDir.has(file.name)) {
            let contentUserFile = "";
            let contentLocalFile = "";

            // If file isn't excluded, read file
            if (!excludeFiles.has(file.name)) {
                contentUserFile = await readFile(join(MainDir, file.name), { encoding: "utf8" });
            }

            // Switch all files
            switch (file.name) {
                // .eslintrc
                case ".eslintrc": {
                    const ctntUsFileJson = JSON.parse(contentUserFile);
                    if (ctntUsFileJson.extends !== file.extends) {
                        log(E_SEV.CRIT, msg.eslintExtends, file.name);
                    }
                    if (Reflect.has(ctntUsFileJson, "rules")) {
                        log(E_SEV.WARN, msg.eslintRulesKey, file.name);
                    }
                    break;
                }
                // .editorconfig
                case ".editorconfig":
                    contentLocalFile = await readFile(join(__dirname, "..", "template", ".editorconfig"), { encoding: "utf8" });
                    if (contentUserFile !== contentLocalFile) {
                        log(E_SEV.WARN, msg.editorConf, file.name);
                    }
                    break;
                // .commitlint.config.js
                case "commitlint.config.js":
                    if (!contentUserFile.indexOf("['@commitlint/config-conventional']")) {
                        log(E_SEV.CRIT, msg.commitLint, file.name);
                    }
                    break;
                default:
            }
            continue;
        }

        // If file doesn't exist
        if (file.name === "index.d.ts") {
            log(E_SEV.WARN, msg.fileNotExist, file.name);
        }
        else {
            log(E_SEV.CRIT, msg.fileNotExist, file.name);
        }
    }

    // Folder management
    for (const dir of requiredDir) {
        if (!elemMainDir.has(dir)) {
            switch (dir) {
                case "src":
                    log(E_SEV.CRIT, msg[dir], dir);
                    break;
                case "test":
                    log(E_SEV.WARN, msg[dir], dir);
                    break;
                default:
                    log(E_SEV.INFO, msg[dir], dir);
            }
        }
    }

    // If slimio.toml exists for projects structure
    if (elemMainDir.has("slimio.toml")) {
        const manifest = Manifest.open().toJSON();
        switch (manifest.type) {
            // CLI
            case "CLI": {
                // If the main directory content a bin folder
                if (elemMainDir.has("bin")) {
                    try {
                        const ctnIndexFile = await readFile(join(MainDir, "bin", "index.js"));
                        // eslint-disable-next-line max-depth
                        if (ctnIndexFile.indexOf("#!/usr/bin/env node")) {
                            log(E_SEV.WARN, msg.shebang);
                            break;
                        }
                    }
                    catch (error) {
                        log(E_SEV.CRIT, msg.indexJsNotExist);
                    }
                }

                // Or not
                else {
                    log(E_SEV.CRIT, msg.binNotExist);
                }
                // preferGlobal, bin, main in package.json
                console.log(msg.rootFieldsCLI);
                break;
            }
            // N-API
            case "NAPI":
                // If include folder doesn't exist.
                if (!elemMainDir.has("include")) {
                    log(E_SEV.CRIT, msg.napiInclude);
                }

                // If binding.gyp file doesn't exist
                if (!elemMainDir.has("binding.gyp")) {
                    log(E_SEV.CRIT, msg.napiBinding);
                }

                // gypfile in package.json
                console.log(msg.rootFieldsNAPI);
                break;
            default:
        }
    }

    // If slimio manisfest doesn't installed in this project => return
    else {
        log(E_SEV.CRIT, msg.manifest);
    }
}

main(pathMainDir).catch(console.error);

#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const { red, green, yellow } = require("kleur");
const Manifest = require("@slimio/manifest");

// Constants
const pathMainDir = join(process.cwd(), "test");
const requiredFiles = require("../src/requiredFiles.json");
const msg = require("../src/messages.js");
const requiredDir = new Set(["src", "test", "benchmark", "docs"]);
const excludeFiles = new Set(["package.json", "LICENSE"]);

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @param MainDir Constant pathMainDir
 * @returns {Console}
 */

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
                        console.log(red("| CRITICAL :"), green(file.name), msg.eslintExtends);
                    }
                    if (Reflect.has(ctntUsFileJson, "rules")) {
                        console.log(yellow("| WARNING :"), green(file.name), msg.eslintRulesKey);
                    }
                    break;
                }
                // .editorconfig
                case ".editorconfig":
                    contentLocalFile = await readFile(join(__dirname, "..", "template", ".editorconfig"), { encoding: "utf8" });
                    if (contentUserFile !== contentLocalFile) {
                        console.log(yellow("| WARNING :"), green(file.name), msg.editorConf);
                    }
                    break;
                // .commitlint.config.js
                case "commitlint.config.js":
                    if (!contentUserFile.indexOf("['@commitlint/config-conventional']")) {
                        console.log(red("| CRITICAL :"), green(file.name), msg.commitLint);
                    }
                    break;
                default:
            }
            continue;
        }

        // If file doesn't exist
        if (file.name === "index.d.ts") {
            console.log(yellow("| WARNING :"), green(file.name), msg.NotExist);
        }
        else {
            console.log(red("| CRITICAL :"), green(file.name), msg.NotExist);
        }
    }

    // If slimio.toml exists
    if (elemMainDir.has("slimio.toml")) {
        manifest = Manifest.open().toJSON();
        switch (manifest.type) {
            // CLI
            case "CLI": {
                const folder = yellow("bin folder");
                const file = yellow("index.js file");

                // If the main directory content a bin folder
                if (elemMainDir.has("bin")) {
                    try {
                        const ctnIndexFile = await readFile(join(MainDir, "bin", "index.js"));
                        // eslint-disable-next-line max-depth
                        if (ctnIndexFile.indexOf("#!/usr/bin/env node")) {
                            console.log(yellow("| WARNING :"), msg.shebang);
                            break;
                        }
                    }
                    catch (error) {
                        console.log(yellow("| WARNING :"), msg.indexJsNotExist);
                        break;
                    }
                }

                // Or not
                else {
                    console.log(red("| CRITICAL :"), msg.binNotExist);
                    break;
                }
                // preferGlobal, bin, main in package.json
                console.log(msg.rootFields);
                break;
            }
            // N-API
            case "N-API":
                break;
            default:
        }
    }

    // If slimio manisfest doesn't installed in this project => return
    else {
        console.log(red("| CRITICAL :"), msg.manifest);
    }
}

main(pathMainDir).catch(console.error);

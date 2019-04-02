#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join } = require("path");
const { EOL } = require("os");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const emoji = require("node-emoji");
const { green } = require("kleur");
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const requiredFiles = require("../src/requiredFiles.json");
const msg = require("../src/messages.js");

// Constants
const PATH_MAIN_DIR = process.cwd();
const REQUIRE_DIR = new Set(["src", "test", "benchmark", "docs"]);
const EXCLUDE_FILES = new Set(["LICENSE"]);
const README_TITLES =
    [
        "requirements",
        "getting started",
        "usage example",
        "api",
        "licence"
    ];
const E_SEV = Object.freeze({
    CRIT: ":no_entry:",
    WARN: ":warning",
    INFO: ":bulb:"
});

/**
 * @func log
 * @description Log infos customs into the console
 * @param {!String} severity
 * @param {!String} message
 * @param {String} file
 * @returns {void} Into the console
 */

function log(severity, message, file) {
    // Messages into console
    if (file === undefined) {
        console.log("|", emoji.get(severity), " :", message);
    }
    else {
        console.log("|", emoji.get(severity), " :", green(file), message);
    }
    // Exit if case critical
    if (severity === E_SEV.CRIT) {
        process.exit(1);
    }
}

/**
 * @async
 * @func readFileLocal
 * @description Read the file given in argument
 * @param {!String} fileName file name of the main function
 * @returns {String} utf8 String of the file
 */

async function readFileLocal(fileName) {
    return readFile(join(__dirname, "..", "template", fileName), { encoding: "utf8" });
}

/**
 * @async
 * @func switchFile
 * @description Switch all files in main directory
 * @param {!String} fileName file name of the main function
 * @param {!Set<String>} elemMainDir contain array the elements of main directory
 * @returns {void} Into the console with function log
 */

async function switchFile(fileName, elemMainDir) {
    // Read file
    const userCtnFile = await readFile(join(PATH_MAIN_DIR, fileName), { encoding: "utf8" });

    // Switch all files
    switch (fileName) {
        // .commitlint.config.js
        case "commitlint.config.js":
            if (!userCtnFile.indexOf("['@commitlint/config-conventional']")) {
                log(E_SEV.CRIT, msg.commitLint, fileName);
            }
            break;
        // .editorconfig
        case ".editorconfig": {
            const localCtnFile = await readFileLocal(fileName);
            if (userCtnFile !== localCtnFile) {
                log(E_SEV.WARN, msg.editorConf, fileName);
            }
            break;
        }
        // .eslintrc
        case ".eslintrc": {
            const userCtnFileJSON = JSON.parse(userCtnFile);
            if (userCtnFileJSON.extends !== "@slimio/eslint-config") {
                log(E_SEV.CRIT, msg.eslintExtends, fileName);
            }
            if (Reflect.get(userCtnFileJSON, "rules")) {
                log(E_SEV.WARN, msg.eslintRulesKey, fileName);
            }
            break;
        }
        // .npmignore & .env
        case ".npmignore": {
            const localCtnFile = await readFileLocal(fileName);
            // File processing
            const splitLocalFile = localCtnFile.split(EOL).slice(0, -1);
            const splitUserFile = new Set(userCtnFile.split(EOL));
            // Check
            for (const ligne of splitLocalFile) {
                if (!splitUserFile.has(ligne)) {
                    log(E_SEV.CRIT, msg.npmignore, fileName);
                }
            }
            // Check .env
            if (elemMainDir.has(".env") && !splitUserFile.has(".env")) {
                log(E_SEV.WARN, msg.env, ".env");
            }
            break;
        }
        // npmrc
        case ".npmrc":
            if (userCtnFile.includes("package-lock=false") && elemMainDir.has("package-lock.json")) {
                log(E_SEV.CRIT, msg.npmrc, fileName);
            }
            break;
        // README.md
        case "README.md":
            for (let idx = 0; idx < README_TITLES.length; idx++) {
                if (userCtnFile.includes(README_TITLES[idx])) {
                    continue;
                }
                log(E_SEV.CRIT, msg.readme, fileName);
            }
            break;
        // .gitignore
        case ".gitignore":
            for (let idx = 0; idx < README_TITLES.length; idx++) {
                if (userCtnFile.includes(README_TITLES[idx])) {
                    continue;
                }
                log(E_SEV.CRIT, msg.readme, fileName);
            }
            break;
        default:
    }
}

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @returns {void} Into the console with function log
 */

// eslint-disable-next-line max-lines-per-function
async function main() {
    // Read the main directory of user
    const elemMainDir = new Set(await readdir(PATH_MAIN_DIR));

    // Loop on required files array
    for (const file of requiredFiles) {
        // If file not exist
        if (!elemMainDir.has(file.name)) {
            // If file doesn't exist
            if (file.name === "index.d.ts" || file.name === ".npmrc") {
                log(E_SEV.WARN, msg.fileNotExist, file.name);
                continue;
            }
            else {
                log(E_SEV.CRIT, msg.fileNotExist, file.name);
            }
        }
        // If file is excluded, continue
        if (EXCLUDE_FILES.has(file.name)) {
            continue;
        }

        // Switch all files
        await switchFile(file.name, elemMainDir);
    }

    // Folder management
    const filteredDirs = REQUIRE_DIR.filter((name) => !elemMainDir.has(name));
    for (const dir of filteredDirs) {
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

    // If slimio manisfest doesn't installed in this project, exit
    if (!elemMainDir.has("slimio.toml")) {
        log(E_SEV.CRIT, msg.manifest);
    }

    // If slimio.toml exists for projects structure
    const manifest = Manifest.open();
    switch (manifest.type) {
        // CLI
        case "CLI": {
            // If the main directory content a bin folder
            if (elemMainDir.has("bin")) {
                try {
                    const ctnIndexFile = await readFile(join(PATH_MAIN_DIR, "bin", "index.js"));
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

main().catch(console.error);

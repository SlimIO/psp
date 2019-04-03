#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join } = require("path");
const { EOL } = require("os");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const emoji = require("node-emoji");
const { green, cyan } = require("kleur");
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const REQUIRED_ELEMS = require("../src/requiredElems.json");
const MSG = require("../src/messages.js");

// Constants
const PATH_MAIN_DIR = process.cwd();
const PROCESS_ARG = process.argv[2];
const EXCLUDE_FILES = new Set(REQUIRED_ELEMS.EXCLUDE_FILES);
const INFO_CONTENT_FILE = new Set(REQUIRED_ELEMS.INFO_CONTENT_FILE);
const ACCEPT_ARGV = new Set(REQUIRED_ELEMS.ACCEPT_ARGV);
const PROJECT_TYPE = new Set(REQUIRED_ELEMS.PROJECT_TYPE);
const TYPE_OF_PROJECT = { type: "" };

/**
 * @func log
 * @description Log infos customs into the console
 * @param {!String} severity emoji with const REQUIRED_ELEMS.E_SEV
 * @param {!String} message message MSG module
 * @param {String} file file name
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
    if (severity === REQUIRED_ELEMS.E_SEV.CRIT) {
        process.exit(1);
    }
}

/**
 * @func readFileLocal
 * @description Read the file given in argument
 * @param {!String} fileName file name of the main function
 * @returns {String} utf8 String of the file
 */
function readFileLocal(fileName) {
    return readFile(join(__dirname, "..", "template", fileName), { encoding: "utf8" });
}

/**
 * @async
 * @func checkFileContent
 * @description Check the content of a given fileName
 * @param {!String} fileName file name of the main function
 * @param {!Set<String>} elemMainDir contain array the elements of main directory
 * @returns {void} Into the console with function log
 */
async function checkFileContent(fileName, elemMainDir) {
    // Read file
    const userCtnFile = await readFile(join(PATH_MAIN_DIR, fileName), { encoding: "utf8" });

    // Switch all files
    switch (fileName) {
        // .commitlint.config.js
        case "commitlint.config.js":
            if (!userCtnFile.indexOf("['@commitlint/config-conventional']")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.commitLint, fileName);
            }
            break;
        // .editorconfig
        case ".editorconfig": {
            const localCtnFile = await readFileLocal(fileName);
            if (userCtnFile !== localCtnFile) {
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.editorConf, fileName);
            }
            break;
        }
        // .eslintrc
        case ".eslintrc": {
            const userCtnFileJSON = JSON.parse(userCtnFile);
            if (userCtnFileJSON.extends !== "@slimio/eslint-config") {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.eslintExtends, fileName);
            }
            if (Reflect.get(userCtnFileJSON, "rules")) {
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.eslintRulesKey, fileName);
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
                    log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.npmignore, fileName);
                }
            }
            // Check .env
            if (elemMainDir.has(".env") && !splitUserFile.has(".env")) {
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.npmEnv, ".env");
            }
            break;
        }
        // npmrc
        case ".npmrc":
            if (userCtnFile.includes("package-lock=false") && elemMainDir.has("package-lock.json")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.npmrc, fileName);
            }
            break;
        // README.md
        case "README.md": {
            const userCtnFileLCase = userCtnFile.toLowerCase();
            for (let idx = 0; idx < REQUIRED_ELEMS.README_TITLES.length; idx++) {
                if (userCtnFileLCase.includes(REQUIRED_ELEMS.README_TITLES[idx])) {
                    continue;
                }
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.readme, fileName);
            }
            if (TYPE_OF_PROJECT.type.toLowerCase() === "package" && !userCtnFileLCase.includes("usage example")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.readmeEx, fileName);
            }
            break;
        }
        // .gitignore
        case ".gitignore": {
            const localCtnFile = await readFileLocal(fileName);
            // Filter, remove index equal at '' & with '#'
            const cleanLocFileToArray = localCtnFile.split(EOL).filter((str) => str !== "" && !str.includes("#"));
            // Check
            for (const index of cleanLocFileToArray) {
                if (userCtnFile.includes(index)) {
                    continue;
                }
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.gitignore, fileName);
            }
            // Check .env
            if (elemMainDir.has(".env") && !userCtnFile.includes(".env")) {
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.gitEnv, ".env");
            }
            break;
        }
        // .package
        case "package.json": {
            // Variables
            const userCtnFileJSON = JSON.parse(userCtnFile);
            const scripts = userCtnFileJSON.scripts;
            const dep = userCtnFileJSON.dependencies;
            const requiredScripts = REQUIRED_ELEMS.SCRIPTS[TYPE_OF_PROJECT.type];
            const requiredDevDep = REQUIRED_ELEMS.DEVDEP;
            let requiredDep;
            // Ckeck scripts
            for (const keyScripts of requiredScripts) {
                if (Reflect.has(scripts, keyScripts)) {
                    continue;
                }
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.pkgScripts(TYPE_OF_PROJECT.type, keyScripts));
            }
            // Check dependencies
            if (TYPE_OF_PROJECT.type === "addon" || TYPE_OF_PROJECT.type === "napi") {
                requiredDep = REQUIRED_ELEMS.DEP[TYPE_OF_PROJECT.type];
                if (!Reflect.has(dep, requiredDep[0]) && !Reflect.has(dep, requiredDep[1])) {
                    log(REQUIRED_ELEMS.E_SEV.WARN, MSG.pkgScripts(TYPE_OF_PROJECT.type, keyScripts));
                }
            }
            break;
        }
        default:
    }
}

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @returns {void} Into the console with function log
 */
async function main() {
    // Read process.argv
    if (PROCESS_ARG !== undefined) {
        if (!ACCEPT_ARGV.has(PROCESS_ARG)) {
            log(REQUIRED_ELEMS.E_SEV.CRIT, "Impossible command");
        }

        if (INFO_CONTENT_FILE.has(PROCESS_ARG)) {
            const arrowUp = emoji.get(REQUIRED_ELEMS.E_SEV.ARROW_UP);
            const arrowDown = `${emoji.get(REQUIRED_ELEMS.E_SEV.ARROW_DOWN)}\n`;
            console.log(arrowDown, cyan(await readFileLocal(PROCESS_ARG)), arrowUp);
            process.exit();
        }
    }

    // Read the main directory of user
    const elemMainDir = new Set(await readdir(PATH_MAIN_DIR));

    // If slimio manisfest doesn't installed in this project, exit
    if (!elemMainDir.has("slimio.toml")) {
        log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.manifest);
        // Exit
    }

    // If type of .toml file isn't valid
    const manifest = Manifest.open();
    if (!PROJECT_TYPE.has(manifest.type.toLowerCase())) {
        log(REQUIRED_ELEMS.E_SEV.CRIT, "The type of the .toml file can only contain 'NAPI', 'CLI', 'Addon', 'Package'");
    }
    TYPE_OF_PROJECT.type = manifest.type.toLowerCase();
    // If slimio.toml exists for projects structure
    switch (TYPE_OF_PROJECT.type) {
        // CLI
        case "cli": {
            // If the main directory content a bin folder
            if (!elemMainDir.has("bin")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.binNotExist);
                // Exit
            }

            try {
                const ctnIndexFile = await readFile(join(PATH_MAIN_DIR, "bin", "index.js"), { encoding: "utf8" });
                if (!ctnIndexFile.includes("#!/usr/bin/env node")) {
                    log(REQUIRED_ELEMS.E_SEV.WARN, MSG.shebang);
                    break;
                }
            }
            catch (error) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.indexJsNotExist);
            }
            // Infos: preferGlobal, bin, main in package.json
            console.log(MSG.rootFieldsCLI);
            break;
        }
        // N-API
        case "napi":
            // If include folder doesn't exist.
            if (!elemMainDir.has("include")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.napiInclude);
            }

            // If binding.gyp file doesn't exist
            if (!elemMainDir.has("binding.gyp")) {
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.napiBinding);
            }

            // Infos: gypfile in package.json
            console.log(MSG.rootFieldsNAPI);
            break;
        default:
    }

    // Loop on required files array
    for (const fileName of REQUIRED_ELEMS.FILE_TO_CHECKS) {
        // If file not exist
        if (!elemMainDir.has(fileName)) {
            // If file doesn't exist
            if (fileName === "index.d.ts" || fileName === ".npmrc") {
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG.fileNotExist, fileName);
                continue;
            }
            log(REQUIRED_ELEMS.E_SEV.CRIT, MSG.fileNotExist, fileName);
            // Exit
        }
        // If file is excluded, continue
        if (EXCLUDE_FILES.has(fileName)) {
            continue;
        }

        // Switch all files
        await checkFileContent(fileName, elemMainDir);
    }

    // Folder management
    const filteredDirs = REQUIRED_ELEMS.REQUIRE_DIR.filter((name) => !elemMainDir.has(name));
    for (const dir of filteredDirs) {
        switch (dir) {
            case "src":
                log(REQUIRED_ELEMS.E_SEV.CRIT, MSG[dir], dir);
                break;
            case "test":
                log(REQUIRED_ELEMS.E_SEV.WARN, MSG[dir], dir);
                break;
            default:
                log(REQUIRED_ELEMS.E_SEV.INFO, MSG[dir], dir);
        }
    }
}

main().catch(console.error);

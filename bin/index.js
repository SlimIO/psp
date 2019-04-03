#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join, extname } = require("path");
const { EOL } = require("os");

// Require Third-party Dependencies
const inquirer = require("inquirer");
const emoji = require("node-emoji");
const { green, cyan } = require("kleur");
const Manifest = require("@slimio/manifest");

// Require Internal Dependencies
const requiredElem = require("../src/requiredElems.json");
const msg = require("../src/messages.js");

// Constants
const PROCESS_ARG = process.argv[2];
const EXCLUDE_FILES = new Set(requiredElem.EXCLUDE_FILES);
const INFO_CONTENT_FILE = new Set(requiredElem.INFO_CONTENT_FILE);
const ACCEPT_ARGV = new Set(requiredElem.ACCEPT_ARGV);
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const { WARN, CRIT, INFO } = requiredElem.E_SEV;

// Globals
let typeOfProject = "";

/**
 * @func log
 * @description Log infos customs into the console
 * @param {!String} severity emoji with const requiredElem.E_SEV
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
    if (severity === CRIT) {
        process.exit(1);
    }
}

/**
 * @async
 * @generator
 * @func getJavascriptFiles
 * @memberof Utils
 * @param {!String} dir root directory
 * @returns {AsyncIterableIterator<String>}
 */
async function* getJavascriptFiles(dir) {
    const files = await readdir(dir);
    const tDirs = [];
    // Check js file main directory
    for (const file of files) {
        if (extname(file) === ".js") {
            yield join(dir, file);
            continue;
        }

        if (EXCLUDE_DIRS.has(file)) {
            continue;
        }
        tDirs.push(file);
    }
    // Check js files in all main directory folders
    for (const name of tDirs) {
        const st = await stat(join(dir, name));
        if (st.isDirectory()) {
            yield* getJavascriptFiles(join(dir, name));
        }
    }
}

/**
 * @func readFileLocal
 * @description Read the file given in argument
 * @param {!String} fileName file name of the main function
 * @returns {String} utf8 String of the file given in argument
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
// eslint-disable-next-line max-lines-per-function
async function checkFileContent(fileName, elemMainDir) {
    // Read file
    const userCtnFile = await readFile(join(process.cwd(), fileName), { encoding: "utf8" });

    // Switch all files
    switch (fileName) {
        // .commitlint.config.js
        case "commitlint.config.js":
            if (userCtnFile.indexOf("\"@commitlint/config-conventional\"") === -1) {
                log(CRIT, msg.commitLint, fileName);
            }
            break;
        // .editorconfig
        case ".editorconfig": {
            const localCtnFile = await readFileLocal(fileName);
            if (userCtnFile !== localCtnFile) {
                log(WARN, msg.editorConf, fileName);
            }
            break;
        }
        // .eslintrc
        case ".eslintrc": {
            const userCtnFileJSON = JSON.parse(userCtnFile);
            if (userCtnFileJSON.extends !== "@slimio/eslint-config") {
                log(CRIT, msg.eslintExtends, fileName);
            }
            if (Reflect.has(userCtnFileJSON, "rules")) {
                log(WARN, msg.eslintRulesKey, fileName);
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
                log(CRIT, msg.gitignore, fileName);
            }
            // Check .env
            if (elemMainDir.has(".env") && !userCtnFile.includes(".env")) {
                log(WARN, msg.gitEnv, ".env");
            }
            break;
        }
        // jsDoc
        case "jsdoc.json": {
            const jsdonParsed = JSON.parse(userCtnFile);
            const include = new Set(jsdonParsed.source.include);
            for await (const file of getJavascriptFiles(process.cwd())) {
                const fileName = file.split("\\").slice(-1)[0];
                if (include.has(fileName)) {
                    continue;
                }
                log(CRIT, msg.jsdoc, fileName);
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
                    log(CRIT, msg.npmignore, fileName);
                }
            }
            // Check .env
            if (elemMainDir.has(".env") && !splitUserFile.has(".env")) {
                log(WARN, msg.npmEnv, ".env");
            }
            break;
        }
        // npmrc
        case ".npmrc":
            if (userCtnFile.includes("package-lock=false") && elemMainDir.has("package-lock.json")) {
                log(WARN, msg.npmrc, fileName);
            }
            break;
        // package.json
        case "package.json": {
            // Variables
            const userCtnFileJSON = JSON.parse(userCtnFile);
            const scripts = userCtnFileJSON.scripts;
            const dep = userCtnFileJSON.dependencies;
            const devDep = userCtnFileJSON.devDependencies;
            const requiredScripts = requiredElem.PKG_SCRIPTS[typeOfProject];
            const requiredDevDep = requiredElem.PKG_DEVDEP;
            const requiredOthers = requiredElem.PKG_OTHERS;
            // Ckeck scripts
            for (const keyScripts of requiredScripts) {
                if (Reflect.has(scripts, keyScripts)) {
                    continue;
                }
                log(WARN, msg.pkgScripts(typeOfProject, keyScripts));
            }
            // Check dependencies
            if (typeOfProject === "addon" || typeOfProject === "napi") {
                const requiredDep = requiredElem.PKG_DEP[typeOfProject];
                if (!Reflect.has(dep, requiredDep[0]) && !Reflect.has(dep, requiredDep[1])) {
                    log(WARN, msg.pkgDep(typeOfProject, requiredDep[0], requiredDep[1]));
                }
            }
            // check dev dependencies
            for (const keyDepDev of requiredDevDep) {
                if (Reflect.has(devDep, keyDepDev)) {
                    continue;
                }
                log(WARN, msg.pkgDevDep(keyDepDev), fileName);
            }
            // Check others fields
            for (const keyName of requiredOthers) {
                if (Reflect.has(userCtnFileJSON, keyName)) {
                    if (keyName === "keywords" && userCtnFileJSON.keywords.length === 0) {
                        log(WARN, msg.pkgOthersCtn(keyName));
                    }
                    if (keyName === "author" && userCtnFileJSON.author !== "SlimIO") {
                        log(WARN, msg.pkgOthersCtn(keyName, "SlimIO"));
                    }
                    if (keyName === "license" && userCtnFileJSON.license !== "MIT") {
                        log(WARN, msg.pkgOthersCtn(keyName, "MIT"));
                    }
                    if (keyName === "description" && userCtnFileJSON.description === "") {
                        log(WARN, msg.pkgOthersCtn(keyName));
                    }
                    if (keyName === "engines" && userCtnFileJSON.engines.node !== ">=10") {
                        log(WARN, msg.pkgEngines);
                    }
                    if (keyName === "husky" && !Reflect.has(userCtnFileJSON.husky.hooks, "commit-msg")) {
                        log(WARN, msg.pkgHusky);
                    }
                    continue;
                }
                log(WARN, msg.pkgOthers(keyName), fileName);
            }
            // nyc field
            if (Reflect.has(userCtnFileJSON.devDependencies, "nyc") && !Reflect.has(userCtnFileJSON, "nyc")) {
                log(WARN, msg.pkgNyc);
            }

            break;
        }
        // README.md
        case "README.md": {
            const userCtnFileLCase = userCtnFile.toLowerCase();
            if (typeOfProject === "addon") {
                break;
            }
            for (let idx = 0; idx < requiredElem.README_TITLES.length; idx++) {
                if (userCtnFileLCase.includes(requiredElem.README_TITLES[idx])) {
                    continue;
                }
                log(CRIT, msg.readme, fileName);
            }
            if (typeOfProject.toLowerCase() === "package" && !userCtnFileLCase.includes("usage example")) {
                log(CRIT, msg.readmeEx, fileName);
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
            log(CRIT, "Impossible command");
        }

        if (INFO_CONTENT_FILE.has(PROCESS_ARG)) {
            const arrowUp = emoji.get(requiredElem.E_SEV.ARROW_UP);
            const arrowDown = `${emoji.get(requiredElem.E_SEV.ARROW_DOWN)}\n`;
            console.log(arrowDown, cyan(await readFileLocal(PROCESS_ARG)), arrowUp);
            process.exit();
        }
    }

    // Read the main directory of user
    const elemMainDir = new Set(await readdir(process.cwd()));

    // If slimio manisfest doesn't installed in this project, exit
    if (!elemMainDir.has("slimio.toml")) {
        log(CRIT, msg.manifest);
        // Exit
    }

    // If type of .toml file isn't valid
    const manifest = Manifest.open();
    typeOfProject = manifest.type.toLowerCase();
    // If slimio.toml exists for projects structure
    switch (typeOfProject) {
        // CLI
        case "cli": {
            // If the main directory content a bin folder
            if (!elemMainDir.has("bin")) {
                log(CRIT, msg.binNotExist);
                // Exit
            }

            try {
                const ctnIndexFile = await readFile(join(process.cwd(), "bin", "index.js"), { encoding: "utf8" });
                if (!ctnIndexFile.includes("#!/usr/bin/env node")) {
                    log(WARN, msg.shebang);
                    break;
                }
            }
            catch (error) {
                log(CRIT, msg.indexJsNotExist);
            }
            // Infos: preferGlobal, bin, main in package.json
            console.log(msg.rootFieldsCLI);
            break;
        }
        // N-API
        case "napi":
            // If include folder doesn't exist.
            if (!elemMainDir.has("include")) {
                log(CRIT, msg.napiInclude);
            }

            // If binding.gyp file doesn't exist
            if (!elemMainDir.has("binding.gyp")) {
                log(CRIT, msg.napiBinding);
            }

            // Infos: gypfile in package.json
            console.log(msg.rootFieldsNAPI);
            break;
        default:
    }

    // Loop on required files array
    for (const fileName of requiredElem.FILE_TO_CHECKS) {
        // If file not exist
        if (!elemMainDir.has(fileName)) {
            // If type === addon
            if (fileName === "index.d.ts" && typeOfProject === "addon") {
                continue;
            }
            // If file doesn't exist
            if (fileName === "index.d.ts" || fileName === ".npmrc") {
                log(WARN, msg.fileNotExist, fileName);
                continue;
            }
            log(CRIT, msg.fileNotExist, fileName);
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
    const filteredDirs = requiredElem.REQUIRE_DIR.filter((name) => !elemMainDir.has(name));
    for (const dir of filteredDirs) {
        switch (dir) {
            case "src":
                log(CRIT, MSG[dir], dir);
                break;
            case "test":
                log(WARN, MSG[dir], dir);
                break;
            default:
                log(INFO, MSG[dir], dir);
        }
    }
}

main().catch(console.error);

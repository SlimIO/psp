#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile, stat } = require("fs").promises;
const { join, basename, relative, normalize } = require("path");
const assert = require("assert").strict;

// Require Third-party Dependencies
const emoji = require("node-emoji");
const parser = require("file-ignore-parser");
const { argDefinition, parseArg, help } = require("@slimio/arg-parser");
const { cyan, red, yellow, gray } = require("kleur");
const Manifest = require("@slimio/manifest");
const fileNormalize = require("file-normalize");

// Require Internal Dependencies
const requiredElem = require("../src/requiredElems.json");
const msg = require("../src/messages.js");
const { getJavascriptFiles, readFileLocal, listContentFile } = require("../src/utils.js");

// Constants
const CWD = process.cwd();
const REQUIRE_DIR = requiredElem.REQUIRE_DIR;
const EXCLUDE_FILES = new Set(requiredElem.EXCLUDE_FILES);
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const { WARN, CRIT, INFO } = requiredElem.E_SEV;
const STR = "\n|   ";

// Globals
let typeOfProject = "";
let forceMode = false;
const count = { crit: 0, warn: 0 };

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
    const userCtnFile = await readFile(join(CWD, fileName), { encoding: "utf8" });

    // Switch all files
    switch (fileName) {
        case "commitlint.config.js":
            if (userCtnFile.indexOf("\"@commitlint/config-conventional\"") === -1) {
                log(CRIT, msg.commitLint, fileName);
            }
            break;

        case ".editorconfig": {
            const localCtnFile = await readFileLocal(fileName);
            if (fileNormalize.normalizeEOL(userCtnFile) !== fileNormalize.normalizeEOL(localCtnFile)) {
                log(WARN, msg.editorConf.join(STR), fileName);
            }
            break;
        }

        case ".eslintrc": {
            const userCtnFileJSON = JSON.parse(userCtnFile);
            if (userCtnFileJSON.extends !== "@slimio/eslint-config") {
                log(CRIT, msg.eslintExtends, fileName);
            }

            if (Reflect.has(userCtnFileJSON, "rules")) {
                const keys = Object.keys(userCtnFileJSON.rules).map((row) => `${emoji.get(":arrow_right:")} ${row}`);
                log(WARN, msg.eslintRulesKey(keys).join(STR), fileName);
            }

            if (Object.keys(userCtnFileJSON).length > 2) {
                log(WARN, msg.eslintAdd, fileName);
            }
            break;
        }

        case ".gitignore": {
            const retList = await listContentFile(fileName);
            if (retList !== null) {
                log(WARN, msg.gitignore(retList).join(STR), fileName);
            }
            break;
        }

        case "jsdoc.json": {
            const jsdocParsed = JSON.parse(userCtnFile);
            const include = new Set(jsdocParsed.source.include.map((path) => normalize(path)));

            for await (const file of getJavascriptFiles(CWD)) {
                const cleanPath = normalize(relative(CWD, file));
                if (basename(file) === "commitlint.config.js" || include.has(cleanPath)) {
                    continue;
                }
                log(WARN, msg.jsdoc, cleanPath);
            }
            break;
        }

        case ".npmignore": {
            const retList = await listContentFile(fileName);
            if (retList !== null) {
                log(WARN, msg.npmignore(retList).join(STR), fileName);
            }
            break;
        }

        case ".npmrc":
            if (userCtnFile.includes("package-lock=false") && elemMainDir.has("package-lock.json")) {
                log(WARN, msg.npmrc, fileName);
            }
            break;

        case "package.json": {
            // Variables
            const userCtnFileJSON = JSON.parse(userCtnFile);
            const scripts = userCtnFileJSON.scripts || {};
            const dep = userCtnFileJSON.dependencies || {};
            const devDep = userCtnFileJSON.devDependencies || {};
            const requiredScripts = requiredElem.PKG_SCRIPTS[typeOfProject] || [];
            const requiredDevDep = requiredElem.PKG_DEVDEP;
            const requiredOthers = requiredElem.PKG_OTHERS;

            // Ckeck scripts
            for (const keyScripts of requiredScripts) {
                if (Reflect.has(scripts, keyScripts)) {
                    continue;
                }

                if (keyScripts === "report" && Reflect.has(devDep, "c8")) {
                    continue;
                }
                log(WARN, msg.pkgScripts(typeOfProject, keyScripts));
            }

            // Check dependencies
            if (typeOfProject === "addon" || typeOfProject === "napi") {
                const requiredDep = requiredElem.PKG_DEP[typeOfProject];
                if (!Reflect.has(dep, requiredDep[0]) && !Reflect.has(dep, requiredDep[1])) {
                    log(WARN, msg.pkgDep(typeOfProject, requiredDep[0], requiredDep[1]).join(STR));
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
                        log(WARN, msg.pkgEngines.join(STR));
                    }
                    if (keyName === "husky" && !Reflect.has(userCtnFileJSON.husky.hooks, "commit-msg")) {
                        log(WARN, msg.pkgHusky.join(STR));
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
            const titles = new Set(requiredElem.README_TITLES);
            const retList = await listContentFile(fileName, titles);
            if (typeOfProject === "addon") {
                break;
            }

            if (retList !== null) {
                log(WARN, msg.readme(retList).join(STR), fileName);
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
 * @func log
 * @description Log infos customs into the console
 * @param {!String} severity emoji with const requiredElem.E_SEV
 * @param {!String} message message MSG module
 * @param {String} file file name
 * @returns {void} Into the console
 */
function log(severity, message, file) {
    let colorFileName = yellow(file);
    // Color
    if (severity === CRIT) {
        count.crit++;
        colorFileName = red(file);
    }
    else if (severity === WARN) {
        count.warn++;
    }

    // Messages into console
    if (file === undefined) {
        console.log("|", emoji.get(severity), " :", message);
    }
    else {
        console.log("|", emoji.get(severity), " :", colorFileName, message);
    }

    // Exit if case critical
    if (severity === CRIT && !forceMode) {
        process.exit(1);
    }
}

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @returns {void} Into the console with function log
 */
async function main() {
    {
        const argDefs = [
            argDefinition("-h --help", "Show help"),
            argDefinition("--gitignore", "show gitignore help"),
            argDefinition("--editorconfig", "show editorconfig help"),
            argDefinition("--npmignore", "show npmignore help"),
            argDefinition("--force", "Enable force mode")
        ];

        const argv = parseArg(argDefs);
        if (argv.get("help")) {
            help(argDefs);
            process.exit(0);
        }

        forceMode = argv.get("force");
        argv.delete("help");
        argv.delete("force");
        for (const [file, isAsked] of argv.entries()) {
            if (!isAsked) {
                continue;
            }
            console.log("\n---");
            console.log(`File: .${file}:`);
            console.log(cyan(await readFileLocal(`.${file}`)));
            process.exit(0);
        }
    }

    console.log(gray(`\n > Running Project Struct Policy at ${yellow(CWD)}\n`));

    // Read the main directory of user
    const elemMainDir = new Set(await readdir(CWD));

    // If slimio manisfest doesn't installed in this project, then exit
    if (!elemMainDir.has("slimio.toml")) {
        log(CRIT, msg.manifest.join(STR));
    }

    const str = await readFile(join(CWD, "package.json"));
    const pkg = JSON.parse(str);

    // If type of .toml file isn't valid
    const manifest = Manifest.open();
    typeOfProject = manifest.type.toLowerCase();

    // Check version of package/slimio
    if (pkg.version !== manifest.version) {
        log(CRIT, msg.versionDiff);
    }

    if (typeOfProject === "addon") {
        let addon = null;
        try {
            const main = pkg.main || "index.js";
            // eslint-disable-next-line
            addon = require(join(CWD, main));
            assert.strictEqual(addon.constructor.name, "Addon");
        }
        catch (err) {
            log(CRIT, msg.exportAddon);
        }

        if (addon.name !== manifest.name) {
            log(CRIT, msg.nameDiff);
        }
    }

    // If slimio.toml exists for projects structure
    switch (typeOfProject) {
        case "cli": {
            if (!elemMainDir.has("bin")) {
                log(CRIT, msg.binNotExist.join(STR));
            }

            try {
                const ctnIndexFile = await readFile(join(CWD, "bin", "index.js"), { encoding: "utf8" });
                if (!ctnIndexFile.includes("#!/usr/bin/env node")) {
                    log(WARN, msg.shebang);
                    break;
                }
            }
            catch (error) {
                log(CRIT, msg.indexJsNotExist);
            }

            // Infos: preferGlobal, bin, main in package.json
            log(INFO, msg.rootFieldsCLI.join(STR));
            break;
        }

        case "napi": {
            // If include folder doesn't exist.
            if (!elemMainDir.has("include")) {
                log(CRIT, msg.napiInclude.join(STR));
            }

            // If binding.gyp file doesn't exist
            if (!elemMainDir.has("binding.gyp")) {
                log(CRIT, msg.napiBinding.join(STR));
            }

            // Infos: gypfile in package.json
            if (!Reflect.has(pkg, "gypfile")) {
                log(WARN, msg.rootFieldsNAPI.join(STR));
            }
            break;
        }
        default:
    }

    // Loop on required files array
    for (const fileName of requiredElem.FILE_TO_CHECKS) {
        if (!elemMainDir.has(fileName)) {
            // If type === addon
            const isAddonOrCLI = typeOfProject === "addon" || typeOfProject === "cli";
            if (fileName === "index.d.ts" && isAddonOrCLI) {
                continue;
            }

            // If file doesn't exist
            if (fileName === "index.d.ts" || fileName === ".npmrc") {
                log(WARN, msg.fileNotExist, fileName);
                continue;
            }

            if (fileName === "jsdoc.json" && isAddonOrCLI) {
                log(WARN, msg.fileNotExist, fileName);
                continue;
            }

            log(CRIT, msg.fileNotExist, fileName);
            if (forceMode) {
                continue;
            }
        }

        // If file is excluded, continue
        if (EXCLUDE_FILES.has(fileName)) {
            continue;
        }

        // Switch all files
        await checkFileContent(fileName, elemMainDir);
    }

    // Folder management
    // If .gitignore doesn't exist
    if (!elemMainDir.has(".gitignore")) {
        log(CRIT, msg.gitExist);

        return void 0;
    }

    const filteredDirs = REQUIRE_DIR[0].filter((name) => !elemMainDir.has(name));
    for (const dir of filteredDirs) {
        switch (dir) {
            case "src":
                log(WARN, msg[dir], dir);
                break;
            case "test":
                log(WARN, msg[dir], dir);
                break;
            default:
                log(INFO, msg[dir], dir);
        }
    }

    const requiredSets = new Set(REQUIRE_DIR[0]);
    const ignoredSets = await Promise.all([
        parser(".gitignore"),
        parser(".npmignore")
    ]);
    const ignoredFiles = new Set([...ignoredSets[0], ...ignoredSets[1]].map((file) => relative(CWD, file)));
    const ignoredDirs = [...ignoredFiles]
        .filter((file) => !file.includes("*"))
        .filter((file) => elemMainDir.has(file))
        .filter((file) => !requiredSets.has(file))
        .filter((file) => !EXCLUDE_DIRS.has(file));

    for (const dir of ignoredDirs) {
        if (typeOfProject === "napi" && (dir === "build" || dir === "prebuilds")) {
            continue;
        }

        const st = await stat(dir);
        if (!st.isDirectory()) {
            continue;
        }

        log(WARN, msg.ignoreDir, dir);
    }

    return void 0;
}

main()
    .then(() => {
        console.log(`\n Finished with: ${yellow(count.crit)} Criticals and ${yellow(count.warn)} Warnings`);
    })
    .catch(console.error);



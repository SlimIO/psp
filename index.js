/* eslint-disable no-invalid-this */
"use strict";

// Require Node.js Dependencies
const assert = require("assert").strict;
const { readdir, readFile, stat } = require("fs").promises;
const { join, relative } = require("path");
const { pathToFileURL } = require("url");

// Require Third-party Dependencies
const parser = require("file-ignore-parser");
const Manifest = require("@slimio/manifest");
const globby = require("globby");
const is = require("@slimio/is");
const { yellow, gray, white } = require("kleur");

// Require Internal Dependencies
const requiredElem = require("./src/requiredElems.json");
const msg = require("./src/messages.js");
const checkFileContent = require("./src/files");
const { getJavascriptFiles } = require("./src/utils.js");
const { parseScript } = require("./src/ast.js");
const { WARN, CRIT, INFO } = require("./src/severities");

// CONSTANTS
const REQUIRE_DIR = requiredElem.REQUIRE_DIR;
const EXCLUDE_FILES = new Set(requiredElem.EXCLUDE_FILES);
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const NAPI_DEPENDENCIES = new Set(["node-gyp-build", "node-addon-api"]);
const DIR_NAPI_EXCLUDE = new Set(["include", "prebuilds", "build"]);
const DIR_SERVICE_EXCLUDE = new Set(["scripts", "public", "views"]);
const STR = "\n ";

/**
 * @function logHandler
 * @description Log infos customs into the console
 * @param {!string} severity emoji with const requiredElem.E_SEV
 * @param {!string} message message MSG module
 * @param {string} file file name
 * @returns {void} Into the console
 */
function logHandler(severity, message, file) {
    const colorFileName = white().bold(file);
    if (severity === CRIT) {
        this.count.crit++;
    }
    else if (severity === WARN) {
        this.count.warn++;
    }

    // Messages into console
    if (this.verbose) {
        const isObject = is.plainObject(message);
        let localMessage = isObject ? message.message : message;
        localMessage = is.array(localMessage) ? localMessage.join(STR) : localMessage;
        if (file === undefined) {
            console.log(` ${severity}  ${localMessage}`);
        }
        else {
            console.log(` ${severity}  ${colorFileName} ${localMessage}`);
        }

        if (isObject && Reflect.has(message, "description")) {
            console.log(message.description);
        }
    }

    // Exit if case critical
    if (severity === CRIT && !this.forceMode) {
        process.exit(1);
    }
}

/**
 * @async
 * @function psp
 * @param {object} options options
 * @param {boolean} [options.forceMode=false] enable forceMode
 * @param {string} [options.CWD=process.cwd()] working dir where we will execute psp!
 * @param {boolean} [options.isCLI=true] enable/disable CLI mode
 * @param {boolean} [options.verbose=true] enable/disable verbose mode
 * @returns {Promise<void>} Into the console with function log
 */
async function psp(options = Object.create(null)) {
    const { forceMode = false, CWD = process.cwd(), isCLI = true, verbose = true } = options;
    const ctx = {
        forceMode, count: { crit: 0, warn: 0 }, typeOfProject: "", CWD, verbose
    };
    const log = logHandler.bind(ctx);
    if (verbose) {
        console.log(gray().bold(`\n > Running Project Struct Policy at ${yellow().bold(CWD)}\n`));
    }

    // Read the main directory of user
    const elemMainDir = new Set(await readdir(CWD));

    // If slimio manisfest doesn't installed in this project, then exit
    if (!elemMainDir.has("slimio.toml")) {
        log(CRIT, msg.manifest);
        if (isCLI) {
            process.exit(1);
        }
    }

    const str = await readFile(join(CWD, "package.json"));
    const pkg = JSON.parse(str);
    const pkgHasWhiteList = Reflect.has(pkg, "files");
    if (pkgHasWhiteList && Array.isArray(pkg.files)) {
        const matchingFiles = await globby(pkg.files, { cwd: CWD });
        for (const path of pkg.files) {
            if (path.includes("*")) {
                continue;
            }

            const someMatch = matchingFiles.some((completeName) => completeName.startsWith(path));
            if (!someMatch) {
                log(CRIT, msg.pubNoMatch(path));
            }
        }
    }

    // If type of .toml file isn't valid
    const manifest = Manifest.open(join(CWD, "slimio.toml"));
    ctx.typeOfProject = manifest.type.toLowerCase();
    ctx.psp = manifest.psp;

    // Check version of package/slimio
    if (pkg.version !== manifest.version) {
        log(CRIT, msg.versionDiff);
    }

    if (ctx.typeOfProject === "addon") {
        let addon = null;
        try {
            const main = pkg.main || "index.js";
            if (pkg.type === "module") {
                const addonEntryFile = pathToFileURL(join(CWD, main));
                addon = (await import(addonEntryFile)).default;
            }
            else {
                // eslint-disable-next-line
                addon = require(join(CWD, main));
            }
            assert.strictEqual(addon.constructor.name, "Addon");

            if (addon.name !== manifest.name) {
                log(CRIT, msg.nameDiff);
            }
        }
        catch (err) {
            log(CRIT, msg.exportAddon);
        }
    }

    // If slimio.toml exists for projects structure
    switch (ctx.typeOfProject) {
        case "service": {
            if (!elemMainDir.has(".env")) {
                log(CRIT, msg.env, ".env");
            }

            const devDep = pkg.devDependencies || {};
            const dep = pkg.dependencies || {};
            if (!Reflect.has(devDep, "dotenv") && !Reflect.has(dep, "dotenv")) {
                log(WARN, msg.dotenv, "package.json");
            }

            break;
        }

        case "cli": {
            if (!elemMainDir.has("bin")) {
                log(CRIT, msg.binNotExist);
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

            if (Reflect.has(pkg, "preferGlobal")) {
                log(WARN, msg.cliGlobal);
            }

            if (typeof pkg.bin !== "object") {
                log(WARN, msg.rootFieldsCLI);
            }
            break;
        }

        case "napi": {
            // If include folder doesn't exist.
            if (!elemMainDir.has("include")) {
                log(CRIT, msg.gyp.missingIncludeDir);
            }

            // If binding.gyp file doesn't exist
            if (!elemMainDir.has("binding.gyp")) {
                log(CRIT, msg.gyp.missingGyp, "binding.gyp");
            }

            // Infos: gypfile in package.json
            if (!Reflect.has(pkg, "gypfile")) {
                log(WARN, msg.gyp.missingRootGypProperty, "package.json");
            }
            break;
        }
        default:
    }

    // Loop on required files array
    const skipFiles = new Set(["index.d.ts", ".npmrc", ".travis.yml", ".eslintignore"]);
    if (!manifest.psp.jsdoc) {
        skipFiles.add("jsdoc.json");
    }

    const skipDegraded = new Set([".eslintrc", "jsdoc.json"]);
    const skipTypes = new Set(["addon", "cli", "service"]);
    for (const fileName of requiredElem.FILE_TO_CHECKS) {
        if (!elemMainDir.has(fileName)) {
            // If type === addon
            const isAddonOrCLI = skipTypes.has(ctx.typeOfProject);
            if (fileName === "index.d.ts" && isAddonOrCLI) {
                continue;
            }

            if (fileName === "binding.gyp" && ctx.typeOfProject !== "napi") {
                continue;
            }

            if (ctx.typeOfProject === "degraded" && skipDegraded.has(fileName)) {
                continue;
            }

            // If file doesn't exist
            if (skipFiles.has(fileName)) {
                if (fileName === ".npmrc" && !ctx.psp.npmrc) {
                    continue;
                }
                log(INFO, msg.fileNotExist, fileName);
                continue;
            }

            if (fileName === "jsdoc.json" && isAddonOrCLI) {
                log(WARN, msg.fileNotExist, fileName);
                continue;
            }

            // Ignore npm ignore if we have a white list in package.json
            if (fileName === ".npmignore" && pkgHasWhiteList) {
                continue;
            }

            log(ctx.typeOfProject === "degraded" ? WARN : CRIT, msg.fileNotExist, fileName);
            if (ctx.forceMode) {
                continue;
            }
        }

        if (!EXCLUDE_FILES.has(fileName)) {
            await checkFileContent(fileName, logHandler.bind(ctx), ctx);
        }
    }

    // Check for require statment
    {
        const tempDependenciesArray = [];
        const isESM = Reflect.has(pkg, "type") && pkg.type === "module";

        for await (const file of getJavascriptFiles(CWD)) {
            const relativeFile = relative(CWD, file);
            if (ctx.psp.exclude.some((path) => relativeFile.startsWith(path))) {
                continue;
            }

            try {
                const dep = await parseScript(file, { module: isESM });
                tempDependenciesArray.push(...dep);
            }
            catch (err) {
                if (verbose) {
                    console.error(`Failed to parse script ${file}:: ${err.message}`);
                }
            }
        }

        const runtimeDep = new Set(tempDependenciesArray);
        const dependencies = pkg.dependencies || {};
        for (const dep of runtimeDep) {
            if (!Reflect.has(dependencies, dep)) {
                log(WARN, msg.missingDep(dep), "package.json");
            }
        }


        for (const dep of Object.keys(dependencies)) {
            if (runtimeDep.has(dep) || (ctx.typeOfProject === "napi" && NAPI_DEPENDENCIES.has(dep))) {
                continue;
            }

            log(WARN, msg.unusedDep(dep), "package.json");
        }
    }

    // Check directories
    {
        const missingDirectories = REQUIRE_DIR[0].filter((name) => !elemMainDir.has(name));
        for (const dirName of missingDirectories) {
            switch (dirName) {
                case "test":
                case "src":
                    if (ctx.typeOfProject !== "degraded") {
                        log(WARN, msg[dirName], dirName);
                    }
                    break;
                default:
                    log(INFO, msg[dirName], dirName);
            }
        }
    }

    // If .gitignore doesn't exist, then we dont want the next section to execute!
    if (!elemMainDir.has(".gitignore")) {
        log(CRIT, msg.gitExist);

        return ctx.count;
    }

    const requiredSets = new Set(REQUIRE_DIR[0]);
    const ignoredSets = await Promise.all([
        parser(join(CWD, ".gitignore")),
        pkgHasWhiteList ? pkg.files : parser(join(CWD, ".npmignore"))
    ]);
    const ignoredFiles = new Set([...ignoredSets[0], ...ignoredSets[1]].map((file) => relative(CWD, file)));
    const ignoredDirs = [...ignoredFiles]
        .filter((file) => !file.includes("*"))
        .filter((file) => elemMainDir.has(file))
        .filter((file) => !requiredSets.has(file))
        .filter((file) => !EXCLUDE_DIRS.has(file));

    for (const dir of ignoredDirs) {
        if (manifest.psp.exclude.includes(dir)) {
            continue;
        }
        if (ctx.typeOfProject === "napi" && DIR_NAPI_EXCLUDE.has(dir)) {
            continue;
        }
        if (ctx.typeOfProject === "service" && DIR_SERVICE_EXCLUDE.has(dir)) {
            continue;
        }
        if (dir === ".env" || (dir === "bin" && ctx.typeOfProject === "cli")) {
            continue;
        }

        const st = await stat(join(CWD, dir));
        if (st.isDirectory()) {
            log(WARN, msg.ignoreDir, dir);
        }
    }

    return ctx.count;
}

module.exports = psp;

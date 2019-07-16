"use strict";

// Require Node.js Dependencies
const { readdir, readFile, stat } = require("fs").promises;
const { join, basename, relative, normalize } = require("path");
const assert = require("assert").strict;

// Require Third-party Dependencies
const emoji = require("node-emoji");
const parser = require("file-ignore-parser");
const { red, yellow, gray } = require("kleur");
const Manifest = require("@slimio/manifest");
const fileNormalize = require("file-normalize");

// Require Internal Dependencies
const requiredElem = require("./src/requiredElems.json");
const msg = require("./src/messages.js");
const { getJavascriptFiles, readFileLocal, listContentFile } = require("./src/utils.js");
const { parseScript } = require("./src/ast.js");

// CONSTANTS
const REQUIRE_DIR = requiredElem.REQUIRE_DIR;
const EXCLUDE_FILES = new Set(requiredElem.EXCLUDE_FILES);
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const { WARN, CRIT, INFO } = requiredElem.E_SEV;
const STR = "\n|   ";

/**
 * @async
 * @function checkFileContent
 * @description Check the content of a given fileName
 * @param {!string} fileName file name of the main function
 * @param {!Set<string>} elemMainDir contain array the elements of main directory
 * @param {any} ctx context
 * @returns {void} Into the console with function log
 */
async function checkFileContent(fileName, elemMainDir, ctx) {
    const log = logHandler.bind(ctx);
    const userCtnFile = await readFile(join(ctx.CWD, fileName), { encoding: "utf8" });

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
            const retList = await listContentFile(fileName, void 0, { type: ctx.typeOfProject, CWD: ctx.CWD });
            if (retList !== null) {
                log(WARN, msg.gitignore(retList).join(STR), fileName);
            }
            break;
        }

        case "jsdoc.json": {
            if (!ctx.psp.jsdoc) {
                break;
            }
            const jsdocParsed = JSON.parse(userCtnFile);
            const include = new Set(jsdocParsed.source.include.map((path) => normalize(path)));

            for await (const file of getJavascriptFiles(ctx.CWD)) {
                const cleanPath = normalize(relative(ctx.CWD, file));
                if (basename(file) === "commitlint.config.js" || include.has(cleanPath)) {
                    continue;
                }
                log(WARN, msg.jsdoc, cleanPath);
            }

            const jsdocOpts = jsdocParsed.opts || {};
            const dest = jsdocOpts.destination;
            if (typeof dest !== "string" || dest !== "./jsdoc/") {
                log(WARN, msg.jsdocDestination);
            }

            let theme = jsdocOpts.template || null;
            if (theme !== null) {
                if (theme.startsWith("node_modules/")) {
                    theme = theme.slice("node_modules/".length);
                }

                const buf = await readFile(join(ctx.CWD, "package.json"));
                const localPackage = JSON.parse(buf.toString());
                const devDependencies = localPackage.devDependencies || {};

                if (!Reflect.has(devDependencies, theme)) {
                    log(WARN, msg.jsdocTheme(theme));
                }
            }
            break;
        }

        case ".npmignore": {
            const retList = await listContentFile(fileName, void 0, { type: ctx.typeOfProject, CWD: ctx.CWD });
            if (retList !== null) {
                log(WARN, msg.npmignore(retList).join(STR), fileName);
            }
            break;
        }

        case ".travis.yml": {
            // eslint-disable-next-line
            const yaml = require("js-yaml");

            try {
                const travis = yaml.safeLoad(userCtnFile);

                assert.strictEqual(travis.language, "node_js", "'language' must be equal to 'nodejs'");
                assert.strictEqual(Reflect.has(travis, "after_failure"), true, "'after_failure' key is not mandatory");
                assert.strictEqual(Reflect.has(travis, "node_js"), true, "'node_js' field is not mandatory");

                const ver = Number(travis.node_js[0]);
                assert.strictEqual(ver >= 10, true, "node.js version must be equal to 10 or higher");
            }
            catch (err) {
                log(WARN, msg.travis(err.message), fileName);
            }

            break;
        }

        case ".npmrc":
            if (ctx.psp.npmrc === false) {
                break;
            }
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
            const requiredScripts = requiredElem.PKG_SCRIPTS[ctx.typeOfProject] || [];
            const requiredDevDep = requiredElem.PKG_DEVDEP;
            const requiredOthers = requiredElem.PKG_OTHERS;

            // eslint-disable-next-line
            for (let [keyScripts, value] of requiredScripts) {
                const hasC8 = Reflect.has(devDep, "c8");
                if (keyScripts === "report" && hasC8) {
                    continue;
                }

                if (Reflect.has(scripts, keyScripts)) {
                    if (keyScripts === "coverage") {
                        // eslint-disable-next-line
                        value = hasC8 ? "c8 -r=\"html\" npm test" : "nyc npm test";
                    }
                    else if (keyScripts === "test") {
                        // eslint-disable-next-line
                        value = Reflect.has(devDep, "ava") ? "ava --verbose" : "node test/test.js";
                    }

                    if (value !== null && !scripts[keyScripts].includes(value)) {
                        log(WARN, msg.pkgValue(keyScripts, value));
                    }
                    continue;
                }

                log(WARN, msg.pkgScripts(ctx.typeOfProject, keyScripts));
            }

            // Check dependencies
            if (ctx.typeOfProject === "addon" || ctx.typeOfProject === "napi") {
                const requiredDep = requiredElem.PKG_DEP[ctx.typeOfProject];
                if (!Reflect.has(dep, requiredDep[0]) && !Reflect.has(dep, requiredDep[1])) {
                    log(WARN, msg.pkgDep(ctx.typeOfProject, requiredDep[0], requiredDep[1]).join(STR));
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
                    if (keyName === "husky") {
                        const hooks = userCtnFileJSON.husky.hooks || {};
                        if (!Reflect.has(hooks, "commit-msg") || !Reflect.has(hooks, "pre-push")) {
                            log(WARN, msg.pkgHusky.join(STR));
                        }
                        else if (!hooks["pre-push"].includes("eslint") || !hooks["pre-push"].includes("npm test")) {
                            log(WARN, msg.pkgPrepush);
                        }
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
            if (ctx.typeOfProject === "cli" || ctx.typeOfProject === "service") {
                titles.delete("## API");
            }

            const retList = await listContentFile(fileName, titles, { CWD: ctx.CWD });
            if (ctx.typeOfProject === "addon") {
                break;
            }

            if (retList !== null) {
                log(WARN, msg.readme(retList).join(STR), fileName);
            }

            if (ctx.typeOfProject.toLowerCase() === "package" && !userCtnFileLCase.includes("usage example")) {
                log(CRIT, msg.readmeEx, fileName);
            }
            break;
        }
        default:
    }
}

/**
 * @function logHandler
 * @description Log infos customs into the console
 * @param {!string} severity emoji with const requiredElem.E_SEV
 * @param {!string} message message MSG module
 * @param {string} file file name
 * @returns {void} Into the console
 */
function logHandler(severity, message, file) {
    let colorFileName = yellow().bold(file);
    // Color
    if (severity === CRIT) {
        this.count.crit++;
        colorFileName = red().bold(file);
    }
    else if (severity === WARN) {
        this.count.warn++;
    }

    // Messages into console
    if (this.verbose) {
        if (file === undefined) {
            console.log(`| ${emoji.get(severity)} : ${message}`);
        }
        else {
            console.log(`| ${emoji.get(severity)} : ${colorFileName} ${message}`);
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
        log(CRIT, msg.manifest.join(STR));
        if (isCLI) {
            process.exit(1);
        }
    }

    const str = await readFile(join(CWD, "package.json"));
    const pkg = JSON.parse(str);

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

            if (Reflect.has(pkg, "preferGlobal")) {
                log(WARN, msg.cliGlobal);
            }

            if (typeof pkg.bin !== "object") {
                log(WARN, msg.rootFieldsCLI.join(STR));
            }
            break;
        }

        case "napi": {
            // If include folder doesn't exist.
            if (!elemMainDir.has("include")) {
                log(CRIT, msg.napiInclude.join(STR));
            }

            // If binding.gyp file doesn't exist
            inGyp: if (elemMainDir.has("binding.gyp")) {
                try {
                    const buf = await readFile(join(CWD, "binding.gyp"));
                    const binding = JSON.parse(buf.toString());

                    if (!Reflect.has(binding.targets[0], "defines")) {
                        log(WARN, msg.napiExceptions);
                        break inGyp;
                    }

                    const defines = new Set(binding.targets[0].defines);
                    if (!defines.has("NAPI_DISABLE_CPP_EXCEPTIONS")) {
                        log(WARN, msg.napiExceptions);
                    }
                }
                catch (err) {
                    if (ctx.verbose) {
                        console.log("Failed to read/parse binding.gyp file");
                    }
                }
            }
            else {
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
    const skipFiles = new Set(["index.d.ts", ".npmrc", ".travis.yml"]);
    const skipTypes = new Set(["addon", "cli", "service"]);
    for (const fileName of requiredElem.FILE_TO_CHECKS) {
        if (!elemMainDir.has(fileName)) {
            // If type === addon
            const isAddonOrCLI = skipTypes.has(ctx.typeOfProject);
            if (fileName === "index.d.ts" && isAddonOrCLI) {
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

            log(CRIT, msg.fileNotExist, fileName);
            if (ctx.forceMode) {
                continue;
            }
        }

        // If file is excluded, continue
        if (EXCLUDE_FILES.has(fileName)) {
            continue;
        }

        // Switch all files
        await checkFileContent(fileName, elemMainDir, ctx);
    }

    // Check for require statment
    {
        const tArr = [];
        for await (const file of getJavascriptFiles(CWD)) {
            try {
                const dep = await parseScript(file);
                tArr.push(...dep);
            }
            catch (err) {
                if (verbose) {
                    console.error(`Failed to parse script ${file}:: ${err.message}`);
                }
            }
        }

        const runtimeDep = new Set(tArr);
        const dependencies = pkg.dependencies || {};
        for (const dep of runtimeDep) {
            if (!Reflect.has(dependencies, dep)) {
                log(WARN, msg.missingDep(dep), "package.json");
            }
        }

        const napiDeps = new Set(["node-gyp-build", "node-addon-api"]);
        for (const dep of Object.keys(dependencies)) {
            if (runtimeDep.has(dep) || (ctx.typeOfProject === "napi" && napiDeps.has(dep))) {
                continue;
            }

            log(WARN, msg.unusedDep(dep), "package.json");
        }
    }

    // Folder management
    // If .gitignore doesn't exist
    if (!elemMainDir.has(".gitignore")) {
        log(CRIT, msg.gitExist);

        return void 0;
    }

    // Check directories
    {
        const filteredDirs = REQUIRE_DIR[0].filter((name) => !elemMainDir.has(name));
        for (const dir of filteredDirs) {
            switch (dir) {
                case "test":
                case "src":
                    log(WARN, msg[dir], dir);
                    break;
                default:
                    log(INFO, msg[dir], dir);
            }
        }
    }

    const requiredSets = new Set(REQUIRE_DIR[0]);
    const ignoredSets = await Promise.all([
        parser(join(CWD, ".gitignore")),
        parser(join(CWD, ".npmignore"))
    ]);
    const ignoredFiles = new Set([...ignoredSets[0], ...ignoredSets[1]].map((file) => relative(CWD, file)));
    const ignoredDirs = [...ignoredFiles]
        .filter((file) => !file.includes("*"))
        .filter((file) => elemMainDir.has(file))
        .filter((file) => !requiredSets.has(file))
        .filter((file) => !EXCLUDE_DIRS.has(file));

    for (const dir of ignoredDirs) {
        if (ctx.typeOfProject === "napi" && (dir === "build" || dir === "prebuilds")) {
            continue;
        }

        const st = await stat(dir);
        if (!st.isDirectory()) {
            continue;
        }

        log(WARN, msg.ignoreDir, dir);
    }

    return ctx.count;
}

module.exports = psp;

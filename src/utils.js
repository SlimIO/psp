"use strict";

/**
 * @namespace Utils
 */

// Require Node.js Dependencies
const { readdir, readFile, stat } = require("fs").promises;
const { join, extname } = require("path");

// Require Third-party Dependencies
const parser = require("file-ignore-parser");
const emoji = require("node-emoji");
const { green, red } = require("kleur");

// Require Internal Dependencies
const requiredElem = require("../src/requiredElems.json");
const { CROSS, CHECK } = require("./severities");

// CONSTANTS
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const TPL_DIR = join(__dirname, "..", "template");
const FILES_TRANSFORM = new Map([
    [".editorconfig", "editorconfig.txt"],
    [".gitignore", "gitignore.txt"],
    [".npmignore", "npmignore.txt"]
]);

/**
 * @async
 * @generator
 * @function getJavascriptFiles
 * @memberof Utils
 * @param {!string} dir root directory
 * @returns {AsyncIterableIterator<string>}
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
 * @async
 * @function listContentFile
 * @description Parse files and generate an array
 * @param {!string} fileName File name parsed
 * @param {Set<string>} [setObj] If local file doesn't exist (Example, README.md)
 * @param {object} options options
 * @param {string} [options.type="package"] project type
 * @param {string} [options.CWD] CWD
 * @returns {Promise<Array<string>|null>}
 */
async function listContentFile(fileName, setObj, options = Object.create(null)) {
    const { type = "package", CWD = process.cwd() } = options;
    const list = [];
    let userFile = await readFile(join(CWD, fileName));
    let localFile = setObj;
    let missing = false;
    let key = "includes";

    if (typeof setObj === "undefined") {
        localFile = await parser(join(TPL_DIR, FILES_TRANSFORM.get(fileName) || fileName));
        if (fileName === ".gitignore" && type === "napi") {
            localFile.add("build/");
            localFile.add("prebuilds/");
            localFile.add(".vscode/");
            localFile.add(".exe");
            localFile.add(".obj");
        }
        else if (fileName === ".npmignore" && type === "napi") {
            localFile.add("build/");
            localFile.add(".vscode/");
            localFile.add("*.exe");
            localFile.add("*.obj");
        }
        userFile = await parser(join(CWD, fileName));
        key = "has";
    }

    for (const line of localFile) {
        if (!userFile[key](line)) {
            list.push(`${emoji.get(CROSS)} ${red(line)}`);
            missing = true;
            continue;
        }
        list.push(`${emoji.get(CHECK)} ${green(line)}`);
    }

    return missing ? list : null;
}

/**
 * @function readFileLocal
 * @description Read the file given in argument
 * @param {!string} fileName file name of the main function
 * @returns {Promise<string>} utf8 String of the file given in argument
 */
function readFileLocal(fileName) {
    const originalName = FILES_TRANSFORM.get(fileName) || fileName;
    const filePath = join(TPL_DIR, originalName);

    return readFile(filePath, { encoding: "utf8" });
}

module.exports = { getJavascriptFiles, readFileLocal, listContentFile };

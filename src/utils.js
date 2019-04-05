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

// Constants
const CWD = process.cwd();
const EXCLUDE_DIRS = new Set(requiredElem.EXCLUDE_DIRS);
const { CROSS, CHECK } = requiredElem.E_SEV;

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
 * @async
 * @func listContentFile
 * @description Parse files and generate an array
 * @param {!String} fileName File name parsed
 * @param {Set<String>} setObj If local file doesn't exist (Example, README.md)
 * @returns {Promise<Array<String> | null>}
 */
async function listContentFile(fileName, setObj) {
    const list = [];
    let userFile = await readFile(join(CWD, fileName));
    let localFile = setObj;
    let missing = false;
    let key = "includes";

    if (setObj === undefined) {
        localFile = await parser(join(__dirname, "..", "template", fileName));
        userFile = await parser(fileName);
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
 * @func readFileLocal
 * @description Read the file given in argument
 * @param {!String} fileName file name of the main function
 * @returns {Promise<String>} utf8 String of the file given in argument
 */
function readFileLocal(fileName) {
    return readFile(join(__dirname, "..", "template", fileName), { encoding: "utf8" });
}

module.exports = { getJavascriptFiles, readFileLocal, listContentFile };

"use strict";

// Require Node.js Dependencies
const { readdirSync, promises: { readFile } } = require("fs");
const { join } = require("path");

// CONSTANTS
const SKIP_FILE_CONTENT = new Set([".eslintrc", "jsdoc.json"]);
const POOL = [];

// Load files in the local pool!
for (const file of readdirSync(__dirname)) {
    if (file === "index.js") {
        continue;
    }

    // eslint-disable-next-line global-require
    const entry = require(join(__dirname, file));
    POOL.push(entry);
}

/**
 * @async
 * @function checkFileContent
 * @description Check the content of a given fileName
 * @param {!string} fileName file name of the main function
 * @param {any} log log handler
 * @param {any} ctx context
 * @returns {void} Into the console with function log
 */
async function checkFileContent(fileName, log, ctx) {
    if (ctx.typeOfProject === "degraded" && SKIP_FILE_CONTENT.has(fileName)) {
        return;
    }

    const fileContent = await readFile(join(ctx.CWD, fileName), { encoding: "utf8" });
    for (const entry of POOL) {
        if (entry.files.has(fileName)) {
            await entry.execute([fileContent, fileName], log, ctx);
        }
    }
}

module.exports = checkFileContent;

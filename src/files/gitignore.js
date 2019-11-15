"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const parser = require("file-ignore-parser");

// Require Internal Dependencies
const { editorConf } = require("../messages.js");
const { WARN } = require("../severities");

// CONSTANTS
const STR = "\n|   ";
const TPL_DIR = join(__dirname, "..", "..", "template");

async function execute([, fileName], log, ctx) {
    const [contentItems, localItems] = await Promise.all([
        parser(join(ctx.CWD, fileName)),
        parser(join(TPL_DIR, "gitignore.txt"))
    ]);

    const intersection = new Set(
        [...localItems].filter((str) => !contentItems.has(str)));

    if (intersection.size > 0) {
        log(WARN, editorConf.join(STR), fileName);
    }
}

module.exports = {
    files: new Set([".gitignore"]),
    execute
};

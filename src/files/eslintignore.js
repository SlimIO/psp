"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Node.js Dependencies
const { join } = require("path");

// Require Third-party Dependencies
const parser = require("file-ignore-parser");

// Require Internal Dependencies
const messages = require("../messages.js");
const { WARN } = require("../severities");

// CONSTANTS
const TOCHECK = ["src/", "bin/"];

async function execute([, fileName], log, ctx) {
    const items = await parser(join(ctx.CWD, fileName));

    for (const path of TOCHECK) {
        if (items.has(path)) {
            log(WARN, messages.files.eslintignore(path), fileName);
        }
    }
}

module.exports = {
    files: new Set([".eslintignore"]),
    execute
};

"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Node.js Dependencies
const { opendir } = require("fs").promises;

// Require Internal Dependencies
const msg = require("../messages.js");
const { WARN } = require("../severities");

async function hasPackageLock(cwd) {
    const iterator = await opendir(cwd);
    for await (const dirent of iterator) {
        if (dirent.name === "package-lock.json") {
            return true;
        }
    }

    return false;
}

async function execute([fileContent, fileName], log, ctx) {
    if (ctx.psp.npmrc === false) {
        return;
    }
    const hasLock = await hasPackageLock(ctx.CWD);

    if (fileContent.includes("package-lock=false") && hasLock) {
        log(WARN, msg.files.npmrc, fileName);
    }
}

module.exports = {
    files: new Set([".npmrc"]),
    execute
};

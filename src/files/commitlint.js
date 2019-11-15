"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const { CRIT } = require("../severities");
const { commitLint } = require("../messages.js");

async function execute([fileContent, fileName], log, ctx) {
    if (fileContent.indexOf("\"@commitlint/config-conventional\"") === -1) {
        log(CRIT, commitLint, fileName);
    }
}

module.exports = {
    files: new Set(["commitlint.config.js"]),
    execute
};

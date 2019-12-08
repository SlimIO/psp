"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const { CRIT } = require("../severities");
const messages = require("../messages.js");

async function execute([fileContent, fileName], log, ctx) {
    if (fileContent.indexOf("\"@commitlint/config-conventional\"") === -1) {
        log(CRIT, messages.files.commitlint_extends, fileName);
    }
}

module.exports = {
    files: new Set(["commitlint.config.js"]),
    execute
};

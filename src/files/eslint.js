"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const messages = require("../messages.js");
const { CRIT, WARN } = require("../severities");

// CONSTANTS
const SLIMIO_ESLINT_PKG_NAME = "@slimio/eslint-config";

async function execute([fileContent, fileName], log) {
    const userCtnFileJSON = JSON.parse(fileContent);
    if (userCtnFileJSON.extends !== SLIMIO_ESLINT_PKG_NAME) {
        log(CRIT, messages.eslint.extend, fileName);
    }

    if (Reflect.has(userCtnFileJSON, "rules")) {
        log(WARN, messages.eslint.rules(Object.keys(userCtnFileJSON.rules)), fileName);
    }

    if (Object.keys(userCtnFileJSON).length > 2) {
        log(WARN, messages.eslint.toMuchKeys, fileName);
    }
}

module.exports = {
    files: new Set([".eslintrc"]),
    execute
};

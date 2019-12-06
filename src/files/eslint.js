"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const emoji = require("node-emoji");

// Require Internal Dependencies
const msg = require("../messages.js");
const { CRIT, WARN } = require("../severities");

// CONSTANTS
const SLIMIO_ESLINT_PKG_NAME = "@slimio/eslint-config";

async function execute([fileContent, fileName], log) {
    const userCtnFileJSON = JSON.parse(fileContent);
    if (userCtnFileJSON.extends !== SLIMIO_ESLINT_PKG_NAME) {
        log(CRIT, msg.eslintExtends, fileName);
    }

    if (Reflect.has(userCtnFileJSON, "rules")) {
        const keys = Object.keys(userCtnFileJSON.rules).map((row) => `${emoji.get(":arrow_right:")} ${row}`);
        log(WARN, msg.eslintRulesKey(keys), fileName);
    }

    if (Object.keys(userCtnFileJSON).length > 2) {
        log(WARN, msg.eslintAdd, fileName);
    }
}

module.exports = {
    files: new Set([".eslintrc"]),
    execute
};

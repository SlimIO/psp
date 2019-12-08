"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const fileNormalize = require("file-normalize");

// Require Internal Dependencies
const { readFileLocal } = require("../utils.js");
const { WARN } = require("../severities");
const messages = require("../messages.js");

async function execute([fileContent, fileName], log) {
    const localCtnFile = await readFileLocal(fileName);
    if (fileNormalize.normalizeEOL(fileContent) !== fileNormalize.normalizeEOL(localCtnFile)) {
        log(WARN, messages.files.editorconfig_content, fileName);
    }
}

module.exports = {
    files: new Set([".editorconfig"]),
    execute
};

"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const fileNormalize = require("file-normalize");

// Require Internal Dependencies
const { readFileLocal } = require("../utils.js");
const { editorConf } = require("../messages.js");
const { WARN } = require("../severities");

// CONSTANTS
const STR = "\n|   ";

async function execute([fileContent, fileName], log) {
    const localCtnFile = await readFileLocal(fileName);

    if (fileNormalize.normalizeEOL(fileContent) !== fileNormalize.normalizeEOL(localCtnFile)) {
        log(WARN, editorConf.join(STR), fileName);
    }
}

module.exports = {
    files: new Set([".gitignore"]),
    execute
};

"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const { listContentFile } = require("../utils.js");
const { npmignore } = require("../messages.js");
const { WARN } = require("../severities");

// CONSTANTS
const STR = "\n|   ";

async function execute([, fileName], log, { CWD, typeOfProject: type }) {
    const options = { type, CWD };
    const retList = await listContentFile(fileName, void 0, options);

    if (retList !== null) {
        log(WARN, npmignore(retList).join(STR), fileName);
    }
}

module.exports = {
    files: new Set([".npmignore"]),
    execute
};

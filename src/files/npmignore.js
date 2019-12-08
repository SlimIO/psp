"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const { listContentFile } = require("../utils.js");
const messages = require("../messages.js");
const { WARN } = require("../severities");

async function execute([, fileName], log, { CWD, typeOfProject: type }) {
    const options = { type, CWD };
    const retList = await listContentFile(fileName, void 0, options);

    if (retList !== null) {
        log(WARN, messages.files.npmignore_content(retList), fileName);
    }
}

module.exports = {
    files: new Set([".npmignore"]),
    execute
};

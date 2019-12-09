"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const kleur = require("kleur");

// Require Internal Dependencies
const { WARN } = require("../severities");
const messages = require("../messages.js");

async function execute([fileContent, fileName], log, ctx) {
    try {
        const binding = JSON.parse(fileContent);

        if (Reflect.has(binding.targets[0], "defines")) {
            const defines = new Set(binding.targets[0].defines);
            if (!defines.has("NAPI_DISABLE_CPP_EXCEPTIONS")) {
                log(WARN, messages.gyp.disableExceptions, fileName);
            }
        }
        else {
            log(WARN, messages.gyp.disableExceptions, fileName);
        }
    }
    catch (err) {
        if (ctx.verbose) {
            console.log(kleur.red().bold("!! Failed to read/parse binding.gyp file"));
        }
    }
}

module.exports = {
    files: new Set(["binding.gyp"]),
    execute
};

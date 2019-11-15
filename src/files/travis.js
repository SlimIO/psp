"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const yaml = require("js-yaml");

// Require Internal Dependencies
const { travis } = require("../messages.js");
const { WARN } = require("../severities");

async function execute([fileContent, fileName], log) {
    try {
        const travis = yaml.safeLoad(fileContent);

        assert.strictEqual(travis.language, "node_js", "'language' must be equal to 'nodejs'");
        assert.strictEqual(Reflect.has(travis, "after_failure"), true, "'after_failure' key is not mandatory");
        assert.strictEqual(Reflect.has(travis, "node_js"), true, "'node_js' field is not mandatory");

        const ver = Number(travis.node_js[0]);
        assert.strictEqual(ver >= 10, true, "node.js version must be equal to 10 or higher");
    }
    catch (err) {
        log(WARN, travis(err.message), fileName);
    }
}

module.exports = {
    files: new Set(["travis.yml"]),
    execute
};

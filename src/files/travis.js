"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Node.js Dependencies
const assert = require("assert").strict;
const { readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const yaml = require("js-yaml");

// Require Third-party Dependencies
const semver = require("semver");

// Require Internal Dependencies
const messages = require("../messages.js");
const { WARN, CRIT } = require("../severities");

async function execute([fileContent, fileName], log, ctx) {
    const buf = await readFile(join(ctx.CWD, "package.json"));
    const { engines = {} } = JSON.parse(buf.toString());
    const requiredNodeVersion = Reflect.has(engines, "node") ? engines.node : ">=12";

    try {
        const travis = yaml.safeLoad(fileContent);

        assert.strictEqual(travis.language, "node_js", "'language' must be equal to 'nodejs'");
        assert.strictEqual(Reflect.has(travis, "after_failure"), true, "'after_failure' key is not mandatory");
        assert.strictEqual(Reflect.has(travis, "node_js"), true, "'node_js' field is not mandatory");

        const ver = semver.coerce(travis.node_js[0]).version;
        if (!semver.satisfies(ver, requiredNodeVersion)) {
            log(WARN, messages.travis.invalidRange(requiredNodeVersion), fileName);
        }

        if (ctx.typeOfProject === "service" && !Reflect.has(travis, "before_script")) {
            log(CRIT, messages.travis.beforeScript, fileName);
        }

        const os = new Set(travis.os || []);
        if (ctx.platform === "Windows" && !os.has("windows")) {
            log(CRIT, messages.travis.mustBeWindows, fileName);
        }
    }
    catch (err) {
        log(WARN, messages.travis.error(err.message), fileName);
    }
}

module.exports = {
    files: new Set([".travis.yml"]),
    execute
};

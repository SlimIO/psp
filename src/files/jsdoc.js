"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const { join, normalize, relative, basename } = require("path");

// Require Internal Dependencies
const msg = require("../messages.js");
const { getJavascriptFiles } = require("../utils");
const { WARN } = require("../severities");

async function execute([fileContent], log, ctx) {
    if (!ctx.psp.jsdoc) {
        return;
    }
    const jsdocParsed = JSON.parse(fileContent);
    const include = new Set(jsdocParsed.source.include.map((path) => normalize(path)));

    for await (const file of getJavascriptFiles(ctx.CWD)) {
        const cleanPath = normalize(relative(ctx.CWD, file));
        if (ctx.psp.exclude.some((path) => cleanPath.startsWith(path))) {
            continue;
        }

        if (basename(file) === "commitlint.config.js" || include.has(cleanPath)) {
            continue;
        }
        log(WARN, msg.jsdoc, cleanPath);
    }

    const jsdocOpts = jsdocParsed.opts || {};
    const dest = jsdocOpts.destination;
    if (typeof dest !== "string" || dest !== "./jsdoc/") {
        log(WARN, msg.jsdocDestination);
    }

    if (Reflect.has(jsdocOpts, "template")) {
        const theme = jsdocOpts.template.startsWith("node_modules/") ?
            jsdocOpts.template.slice("node_modules/".length) :
            jsdocOpts.template;

        const buf = await readFile(join(ctx.CWD, "package.json"));
        const localPackage = JSON.parse(buf.toString());
        const devDependencies = localPackage.devDependencies || {};

        if (!Reflect.has(devDependencies, theme)) {
            log(WARN, msg.jsdocTheme(theme));
        }
    }
}

module.exports = {
    files: new Set(["jsdoc.json"]),
    execute
};

"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Internal Dependencies
const msg = require("../messages.js");
const requiredElem = require("../requiredElems.json");
const { INFO, WARN } = require("../severities");

function getTestingPhrase(devDep) {
    if (Reflect.has(devDep, "ava")) {
        return "ava";
    }
    if (Reflect.has(devDep, "jest")) {
        return "jest";
    }

    return "node test/test.js";
}

async function execute([fileContent, fileName], log, ctx) {
    const userCtnFileJSON = JSON.parse(fileContent);

    const scripts = userCtnFileJSON.scripts || {};
    const dep = userCtnFileJSON.dependencies || {};
    const devDep = userCtnFileJSON.devDependencies || {};
    const requiredScripts = requiredElem.PKG_SCRIPTS[ctx.typeOfProject] || [];
    const requiredDevDep = requiredElem.PKG_DEVDEP;
    const requiredOthers = requiredElem.PKG_OTHERS;

    // eslint-disable-next-line
    for (let [keyScripts, value] of requiredScripts) {
        const hasC8 = Reflect.has(devDep, "c8");
        const hasJest = Reflect.has(devDep, "jest");
        if (keyScripts === "report" && (hasC8 || hasJest)) {
            continue;
        }
        if (keyScripts === "coverage" && hasJest) {
            continue;
        }

        if (Reflect.has(scripts, keyScripts)) {
            if (keyScripts === "coverage") {
                value = hasC8 ? "c8 -r=\"html\" npm test" : "nyc npm test";
            }
            else if (keyScripts === "test") {
                value = getTestingPhrase(devDep);
            }

            if (value !== null && !scripts[keyScripts].includes(value)) {
                log(WARN, msg.pkgValue(keyScripts, value));
            }
            continue;
        }

        log(WARN, msg.pkgScripts(ctx.typeOfProject, keyScripts));
    }

    // Check dependencies
    if (ctx.typeOfProject === "addon" || ctx.typeOfProject === "napi") {
        const requiredDep = requiredElem.PKG_DEP[ctx.typeOfProject];
        if (!Reflect.has(dep, requiredDep[0]) && !Reflect.has(dep, requiredDep[1])) {
            log(WARN, msg.pkgDep(ctx.typeOfProject, requiredDep[0], requiredDep[1]));
        }
    }

    // check dev dependencies
    for (const keyDepDev of requiredDevDep) {
        if (Reflect.has(devDep, keyDepDev)) {
            continue;
        }
        log(ctx.typeOfProject === "degraded" ? INFO : WARN, msg.pkgDevDep(keyDepDev), fileName);
    }

    // Check others fields
    for (const keyName of requiredOthers) {
        if (Reflect.has(userCtnFileJSON, keyName)) {
            if (keyName === "keywords" && userCtnFileJSON.keywords.length === 0) {
                log(WARN, msg.pkgOthersCtn(keyName));
            }
            if (keyName === "author" && userCtnFileJSON.author !== "SlimIO") {
                log(WARN, msg.pkgOthersCtn(keyName, "SlimIO"));
            }
            if (keyName === "license" && userCtnFileJSON.license !== "MIT") {
                log(WARN, msg.pkgOthersCtn(keyName, "MIT"));
            }
            if (keyName === "description" && userCtnFileJSON.description === "") {
                log(WARN, msg.pkgOthersCtn(keyName));
            }
            if (keyName === "engines" && userCtnFileJSON.engines.node !== ">=12") {
                log(WARN, msg.pkgEngines);
            }
            if (keyName === "husky") {
                const hooks = userCtnFileJSON.husky.hooks || {};
                if (!Reflect.has(hooks, "commit-msg") || !Reflect.has(hooks, "pre-push")) {
                    log(WARN, msg.pkgHusky);
                }
                else if (!hooks["pre-push"].includes("eslint") || !hooks["pre-push"].includes("npm test")) {
                    log(ctx.typeOfProject === "degraded" ? INFO : WARN, msg.pkgPrepush);
                }
            }
            continue;
        }
        log(WARN, msg.pkgOthers(keyName), fileName);
    }

    // nyc field
    if (Reflect.has(userCtnFileJSON.devDependencies, "nyc") && !Reflect.has(userCtnFileJSON, "nyc")) {
        log(WARN, msg.pkgNyc);
    }
}

module.exports = {
    files: new Set(["package.json"]),
    execute
};

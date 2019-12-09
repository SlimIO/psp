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
                log(WARN, msg.package.badScriptValue(keyScripts, value), fileName);
            }
            continue;
        }

        log(WARN, msg.package.missingScript(keyScripts), fileName);
    }

    // Check dependencies
    if (Reflect.has(requiredElem.PKG_DEP, ctx.typeOfProject)) {
        const requiredDep = requiredElem.PKG_DEP[ctx.typeOfProject];
        for (const depName of requiredDep) {
            if (!Reflect.has(dep, depName)) {
                log(WARN, msg.package.missingRequiredDep(ctx.typeOfProject, depName), fileName);
            }
        }
    }

    // check dev dependencies
    for (const keyDepDev of requiredDevDep) {
        if (Reflect.has(devDep, keyDepDev)) {
            continue;
        }
        log(ctx.typeOfProject === "degraded" ? INFO : WARN, msg.package.missingDevDependencies(keyDepDev), fileName);
    }

    // Check others fields
    for (const keyName of requiredOthers) {
        if (Reflect.has(userCtnFileJSON, keyName)) {
            if (keyName === "keywords" && userCtnFileJSON.keywords.length === 0) {
                log(WARN, msg.package.propertyValue(keyName), fileName);
            }
            if (keyName === "author" && userCtnFileJSON.author !== "SlimIO") {
                log(WARN, msg.package.propertyValue(keyName, "SlimIO"), fileName);
            }
            if (keyName === "license" && userCtnFileJSON.license !== "MIT") {
                log(WARN, msg.package.propertyValue(keyName, "MIT"), fileName);
            }
            if (keyName === "description" && userCtnFileJSON.description === "") {
                log(WARN, msg.package.propertyValue(keyName), fileName);
            }
            if (keyName === "engines" && userCtnFileJSON.engines.node !== ">=12") {
                log(WARN, msg.package.engines, fileName);
            }
            if (keyName === "husky") {
                const hooks = userCtnFileJSON.husky.hooks || {};
                if (!Reflect.has(hooks, "commit-msg") || !Reflect.has(hooks, "pre-push")) {
                    log(WARN, msg.package.huskyHook, fileName);
                }
                else if (!hooks["pre-push"].includes("eslint") || !hooks["pre-push"].includes("npm test")) {
                    log(ctx.typeOfProject === "degraded" ? INFO : WARN, msg.package.huskyPrepush, fileName);
                }
            }
            continue;
        }
        log(WARN, msg.package.missingRootProperty(keyName), fileName);
    }

    // nyc field
    if (Reflect.has(userCtnFileJSON.devDependencies, "nyc") && !Reflect.has(userCtnFileJSON, "nyc")) {
        log(WARN, msg.package.nycPropertyRequired, fileName);
    }
}

module.exports = {
    files: new Set(["package.json"]),
    execute
};

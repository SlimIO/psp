"use strict";
/* eslint-disable jsdoc/require-jsdoc */

// Require Third-party Dependencies
const marked = require("marked");

// Require Internal Dependencies
const requiredElem = require("../requiredElems.json");
const { listContentFile } = require("../utils.js");
const msg = require("../messages.js");
const { WARN, CRIT } = require("../severities");

async function execute([fileContent, fileName], log, ctx) {
    const userCtnFileLCase = fileContent.toLowerCase();
    const titles = new Set(requiredElem.README_TITLES);
    if (ctx.typeOfProject === "cli" || ctx.typeOfProject === "service" || ctx.typeOfProject === "degraded") {
        titles.delete("## API");
    }

    // Check badges
    const tokens = marked.lexer(fileContent);
    if (tokens.length > 2 && tokens[1].type === "paragraph") {
        const lines = tokens[1].text.split("\n");
        const badges = new Set();
        for (const text of lines) {
            const result = /\[?!\[([a-zA-Z\s]+)\]/g.exec(text);
            if (result !== null) {
                badges.add(result[1].toLowerCase());
            }
        }

        const difference = requiredElem.MD_BADGES.filter((value) => !badges.has(value));
        if (difference.length > 0) {
            log(WARN, msg.missingBadges(difference), fileName);
        }
    }
    else {
        log(WARN, msg.missingBadges(requiredElem.MD_BADGES), fileName);
    }

    const retList = await listContentFile(fileName, titles, { CWD: ctx.CWD });
    if (ctx.typeOfProject === "addon") {
        return;
    }

    if (retList !== null) {
        log(WARN, msg.readme(retList).join(STR), fileName);
    }

    if (ctx.typeOfProject.toLowerCase() === "package" && !userCtnFileLCase.includes("usage example")) {
        log(CRIT, msg.readmeEx, fileName);
    }
}

module.exports = {
    files: new Set(["README.md"]),
    execute
};

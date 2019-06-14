#!/usr/bin/env node
require("make-promises-safe");

// Require Third-party Dependencies
const { argDefinition, parseArg, help } = require("@slimio/arg-parser");
const { cyan, yellow } = require("kleur");

const { readFileLocal } = require("../src/utils.js");
const psp = require("../index.js");

async function main() {
    let forceMode = false;
    {
        const argDefs = [
            argDefinition("-h --help", "Show help"),
            argDefinition("--gitignore", "show gitignore help"),
            argDefinition("--editorconfig", "show editorconfig help"),
            argDefinition("--npmignore", "show npmignore help"),
            argDefinition("--force", "Enable force mode")
        ];

        const argv = parseArg(argDefs);
        if (argv.get("help")) {
            help(argDefs);
            process.exit(0);
        }

        forceMode = argv.get("force");
        argv.delete("help");
        argv.delete("force");
        for (const [file, isAsked] of argv.entries()) {
            if (!isAsked) {
                continue;
            }
            console.log("\n---");
            console.log(`File: .${file}:`);
            console.log(cyan(await readFileLocal(`.${file}`)));
            process.exit(0);
        }
    }

    const count = await psp(forceMode);
    console.log(`\n Finished with: ${yellow(count.crit)} Criticals and ${yellow(count.warn)} Warnings`);
}
main().catch(console.error);

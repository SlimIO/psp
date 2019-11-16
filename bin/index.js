#!/usr/bin/env node
"use strict";

require("make-promises-safe");

// Require Third-party Dependencies
const { cyan, yellow, white } = require("kleur");
const sade = require("sade");

// Require Internal Dependencies
const { readFileLocal } = require("../src/utils.js");
const psp = require("../index.js");

sade("psp", true)
    .version("0.9.2")
    .option("--gitignore", "show gitignore help", false)
    .option("--editorconfig", "show editorconfig help", false)
    .option("--npmignore", "show npmignore help", false)
    .option("--force", "enable force mode", false)
    .action(async(opts) => {
        const forceMode = Boolean(opts.force);
        delete opts.force;
        delete opts._;

        for (const [file, bool] of Object.entries(opts)) {
            if (bool) {
                console.log("\n---");
                console.log(`File: .${file}:`);
                console.log(cyan(await readFileLocal(`.${file}`)));
                process.exit(0);
            }
        }

        const count = await psp({ forceMode });
        console.log(
            white().bold(`\n Finished with: ${yellow().bold(count.crit)} Criticals and ${yellow().bold(count.warn)} Warnings\n`)
        );
    })
    .parse(process.argv);

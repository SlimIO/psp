#!/usr/bin/env node

// Require Node.js Dependencies

const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies

const { red, green, yellow, bold, black, bgBlack, white } = require("kleur");
const inquirer = require("inquirer");

// Constants

const pathMainDir = process.cwd();
const requiredFiles = require("../src/requiredFiles.json");

const requiredDir = {
    src: "",
    test: "",
    benchmark: "",
    docs: ""
};

/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @param MainDir Constant pathMainDir
 * @returns {Console}
 */

async function main(MainDir) {
    const elemMainDir = new Set(await readdir(MainDir));

    for (const fileRequired of requiredFiles) {
        // If file doesn't exist
        if (!elemMainDir.has(fileRequired.name)) {
            const msg = console.log;
            const key = fileRequired;
            const filSev = key.severity;
            switch (key.name) {
                case "package.json":
                    msg(bold().red(filSev.crit.name), "The file", green(key.name), filSev.crit.message);
                    break;
                case ".eslintrc":
                    msg(black().bgRed(filSev.crit.name), "The file", green(key.name), filSev.crit.message);
                    break;
                case ".editorconfig":
                    msg(black().bgRed(filSev.crit.name), "The file", green(key.name), filSev.crit.message);
                    break;
                case "index.d.ts":
                    msg(yellow(filSev.warn.name), "The file", green(key.name), filSev.warn.message);
                    break;
                case "jsdoc.json":
                    
                    break;
                case "commitlint.config.js":
                    
                    break;
                case "LICENCE":
                    
                    break;
                case ".npmignore":
                    
                    break;
            
                default:
            }
        }
    }
}

main(pathMainDir).catch(console.error);

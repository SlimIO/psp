#!/usr/bin/env node

// Require Node.js Dependencies

const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies

const { red, green, yellow, bold, black, bgRed, white } = require("kleur");
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
 * @func extractDirectory Self-Invoking
 * @description Extract from main directory the list of files and folders
 * @param MainDir Constant pathMainDir
 * @returns {Array}
 */

async function main(MainDir) {
    const elemMainDir = new Set(await readdir(MainDir));

    for (const fileRequired of requiredFiles) {
        // If file doesn't exist
        if (!elemMainDir.has(fileRequired.name)) {
            const msg = console.log;
            const key = fileRequired.name;
            const severityName = fileRequired.severity.cri.name;
            const severityMsg = fileRequired.severity.cri.message;
            switch (key) {
                case "package.json":
                    msg(black().bgRed(severityName), "The file", green(key), severityMsg);
                    break;
                case ".eslintrc":
                    msg(black().bgRed(severityName), "The file", green(key), severityMsg);
                    break;
                case ".editorconfig":
                    
                    break;
                case "index.d.ts":
                    
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

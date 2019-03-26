#!/usr/bin/env node

// Require Node.js Dependencies

const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies

const { red, green, yellow, bold } = require("kleur");
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
        if (!elemMainDir.has(fileRequired.name)) {
            console.log(yellow(fileRequired.severity), "The file", green(fileRequired.name), fileRequired.message);
        }
    }
}

main(pathMainDir).catch(console.error);

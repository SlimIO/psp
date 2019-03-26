#!/usr/bin/env node

// Require Node.js Dependencies

const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies

const { red, green, yellow, bold, black, bgBlack, white } = require("kleur");
const inquirer = require("inquirer");

// Constants

const pathMainDir = join(process.cwd());
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
    const msg = console.log;

    for (const fileRequired of requiredFiles) {
        // If file exist
        if (elemMainDir.has(fileRequired.name)) {
            // Read file
            const fileName = fileRequired.name;
            let contents = "";
            if (fileName !== "package.json" && fileName !== "LICENSE") {
                contents = await readFile(join(MainDir, `/${fileName}`));
                contents = contents.toString();
            }
            // Switch all files
            switch (fileName) {
                case ".eslintrc":
                    
                    break;
            
                default:
                    break;
            }
            continue;
        }
        // If file doesn't exist
        if (fileRequired.name === "index.d.ts") {
            msg(yellow("WARNING :"), green(fileRequired.name), "doesn't exist");
        }
        else {
            msg(bold().red("CRITICAL :"), green(fileRequired.name), "doesn't exist");
        }
    }
}

main(pathMainDir).catch(console.error);

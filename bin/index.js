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

    for (const file of requiredFiles) {
        // If file exist
        if (elemMainDir.has(file.name)) {
            // Read file
            const excludeFiles = new Set(["package.json", "LICENSE"]);
            let contents = "";
            if (!excludeFiles.has(file.name)) {
                contents = await readFile(join(MainDir, `/${file.name}`), { encoding: "utf8" });
            }
            // Switch all files
            switch (file.name) {
                case ".eslintrc":
                    
                    break;
            
                default:
            }
            continue;
        }
        // If file doesn't exist
        if (file.name === "index.d.ts") {
            console.log(yellow("WARNING :"), green(file.name), "doesn't exist");
        }
        else {
            console.log(bold().red("CRITICAL :"), green(file.name), "doesn't exist");
        }
    }
}

main(pathMainDir).catch(console.error);

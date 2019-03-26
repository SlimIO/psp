#!/usr/bin/env node

// Require Node.js Dependencies

const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies

const { red, green, yellow, bold, black, bgBlack, white } = require("kleur");
const inquirer = require("inquirer");

// Constants

const pathMainDir = join(process.cwd(), "/test");
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
            // If file isn't excluded
            if (!excludeFiles.has(file.name)) {
                contents = await readFile(join(MainDir, `/${file.name}`), { encoding: "utf8" });
            }
            // Switch all files
            switch (file.name) {
                case ".eslintrc":
                    if (JSON.parse(contents).extends !== file.contents[0].extends) {
                        console.log(bold().red("CRITICAL :"), green(file.name), `must be extends by ${file.contents[0].extends}`);
                    }
                    if (JSON.parse(contents).rules !== undefined) {
                        console.log(yellow("WARNING :"), green(file.name), "contains a 'rules' field (specifics rules !)");
                    }
                    break;
            
                default:
            }
            continue;
        }
        // If file doesn't exist
        if (file.name === "index.d.ts") {
            console.log(yellow("WARNING :"), green(file.name), "doesn't exist in your main directory");
        }
        else {
            console.log(bold().red("CRITICAL :"), green(file.name), "doesn't exist in your main directory");
        }
    }
}

main(pathMainDir).catch(console.error);

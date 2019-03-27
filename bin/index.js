#!/usr/bin/env node

// Require Node.js Dependencies
const { readdir, readFile } = require("fs").promises;
const { join } = require("path");

// Require Third-party Dependencies
const { red, green, yellow, bold, black, bgBlack, white } = require("kleur");
const inquirer = require("inquirer");

// Constants
const pathMainDir = join(process.cwd(), "test");
const requiredFiles = require("../src/requiredFiles.json");
const excludeFiles = new Set(["package.json", "LICENSE"]);
const msgNotExist = "doesn't exist in your main directory.";

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
            let contentUserFile = "";
            let contentLocalFile = "";

            // If file isn't excluded, read file
            if (!excludeFiles.has(file.name)) {
                contentUserFile = await readFile(join(MainDir, file.name), { encoding: "utf8" });
            }

            // Switch all files
            switch (file.name) {
                case ".eslintrc": {
                    const ctntUsFileJson = JSON.parse(contentUserFile);
                    if (ctntUsFileJson.extends !== file.content[0].extends) {
                        console.log(bold().red("CRITICAL :"), green(file.name), file.message[0]);
                    }
                    if (Reflect.has(ctntUsFileJson, "rules")) {
                        console.log(yellow("WARNING :"), green(file.name), file.message[1]);
                    }
                    break;
                }
                case ".editorconfig":
                    contentLocalFile = await readFile(join(__dirname, "..", "template", ".editorconfig"), { encoding: "utf8" });
                    if (contentUserFile !== contentLocalFile) {
                        console.log(yellow("WARNING :"), green(file.name), file.message[0]);
                    }
                    break;
                case "commitlint.config.js":
                    if (!contentUserFile.indexOf("['@commitlint/config-conventional']")) {
                        console.log(bold().red("CRITICAL :"), green(file.name), file.message[0]);
                    }
                    break;
                default:
            }
            continue;
        }

        // If file doesn't exist
        if (file.name === "index.d.ts") {
            console.log(yellow("WARNING :"), green(file.name), msgNotExist);
        }
        else {
            console.log(bold().red("CRITICAL :"), green(file.name), msgNotExist);
        }
    }
}

main(pathMainDir).catch(console.error);

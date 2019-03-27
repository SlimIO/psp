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
            let contentUserFile = "";
            let contentLocalFile = "";
            // If file isn't excluded
            if (!excludeFiles.has(file.name)) {
                contentUserFile = await readFile(join(MainDir, `/${file.name}`), { encoding: "utf8" });
            }
            // Switch all files
            switch (file.name) {
                case ".eslintrc":
                    if (JSON.parse(contentUserFile).extends !== file.content[0].extends) {
                        console.log(bold().red("CRITICAL :"), green(file.name), file.message[0]);
                    }
                    if (JSON.parse(contentUserFile).rules !== undefined) {
                        console.log(yellow("WARNING :"), green(file.name), file.message[1]);
                    }
                    break;
                case ".editorconfig":
                    contentLocalFile = await readFile(join(__dirname, "../src/.editorconfig"), { encoding: "utf8" });
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
        const message = "doesn't exist in your main directory.";
        if (file.name === "index.d.ts") {
            console.log(yellow("WARNING :"), green(file.name), message);
        }
        else {
            console.log(bold().red("CRITICAL :"), green(file.name), message);
        }
    }
}

main(pathMainDir).catch(console.error);

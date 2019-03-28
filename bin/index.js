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
const requiredDir = new Set(["src", "test", "benchmark", "docs"]);
const excludeFiles = new Set(["package.json", "LICENSE"]);
const msgNotExist = "doesn't exist in your main directory.";


/**
 * @async
 * @func main
 * @description Extract from main directory the list of files and folders
 * @param MainDir Constant pathMainDir
 * @returns {Console}
 */

async function main(MainDir) {
    const elemMainDir = new Set(await readdir(MainDir));
    // If slimio manisfest doesn't installed in this project
    if (!elemMainDir.has("include") && !elemMainDir.has("bin")) {
        console.log(bold().red("CRITICAL :"), "You must install the slimio manifest -", green("npm i @slimio/manifest"));
        console.log(`
        ${green(".toml")} file must be created 
        at the root of the project to determine if 
        your application is CLI or N-API. Go to this 
        link to install this file :
        https://github.com/SlimIO/Manifest
        `);

        return;
    }

    // Loop on required files array
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
                // .eslintrc
                case ".eslintrc": {
                    const ctntUsFileJson = JSON.parse(contentUserFile);
                    if (ctntUsFileJson.extends !== file.extends) {
                        console.log(bold().red("CRITICAL :"), green(file.name), file.message[0]);
                    }
                    if (Reflect.has(ctntUsFileJson, "rules")) {
                        console.log(yellow("WARNING :"), green(file.name), file.message[1]);
                    }
                    break;
                }
                // .editorconfig
                case ".editorconfig":
                    contentLocalFile = await readFile(join(__dirname, "..", "template", ".editorconfig"), { encoding: "utf8" });
                    if (contentUserFile !== contentLocalFile) {
                        console.log(yellow("WARNING :"), green(file.name), file.message);
                    }
                    break;
                // .commitlint.config.js
                case "commitlint.config.js":
                    if (!contentUserFile.indexOf("['@commitlint/config-conventional']")) {
                        console.log(bold().red("CRITICAL :"), green(file.name), file.message);
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

/* eslint-disable max-len */
"use strict";

// Require Third-party Dependencies
const { green, yellow, cyan, red, white, gray } = require("kleur");
const boxen = require("boxen");

function objToString(obj) {
    return `${JSON.stringify(obj, null, 2)}`;
}

function toBox(str) {
    return boxen(str, { padding: { left: 3, right: 3, top: 1, bottom: 1 }, margin: 1, borderStyle: "bold" });
}

// CONSTANTS
const NYC_CONFIG = objToString({
    nyc: {
        "check-coverage": true,
        "per-file": false,
        lines: 98,
        statements: 98,
        functions: 98,
        branches: 90
    }
});

const messages = {
    files: {
        commitlint_extends: {
            message: `must be extended with ${cyan().bold("@commitlint/config-conventional")}`,
            description: toBox(objToString({
                extends: ["@commitlint/config-conventional"]
            }))
        },
        editorconfig_content: {
            message: "content doesn't match our local copy.",
            description: toBox(`Run the following cmd ${cyan().bold("psp --editorconfig")} to get the right content!`)
        },
        eslintignore(path) {
            return { message: `unauthorized path ${cyan().bold(path)}` };
        },
        gitignore_content(files) {
            const lines = files.map((fileName) => `${green().bold("+")} ${white().bold(fileName)}`);

            return {
                message: [
                    "file doesn't contains the right files and/or directories.\n",
                    `${lines.join("\n|   ")}`
                ],
                description: toBox(`Run the following cmd ${cyan().bold("psp --gitignore")} to get the right content!`)
            };
        },
        npmignore_content(files) {
            const lines = files.map((fileName) => `${green().bold("+")} ${white().bold(fileName)}`);

            return {
                message: [
                    "file doesn't contains the right files and/or directories.\n",
                    `${lines.join("\n|   ")}`
                ],
                description: toBox(`Run the following cmd ${cyan().bold("psp --npmignore")} to get the right content!`)
            };
        },
        npmrc: `contain the rule ${cyan().bold("package-lock=false")} but a ${white().bold("package-lock.json")} file is at the root of the project!`
    },
    eslint: {
        extend: {
            message: `must be extended with ${cyan().bold("@slimio/eslint-config")}`,
            description: toBox(objToString({
                extends: "@slimio/eslint-config"
            }))
        },
        rules(rulesList) {
            const rules = rulesList.map(
                (rule) => ` - ${cyan().bold(rule)} ${gray().bold(`https://eslint.org/docs/rules/${rule}`)}`
            ).join("\n");

            return `contain a 'rules' section (so remember to check the validity and usefulness of the listed rules).\n\n${rules}\n`;
        },
        toMuchKeys: "contains more than 2 root keys (non-standard configuration)"
    },
    jsdoc: {
        fileMissing: {
            message: `is missing in the ${yellow().bold("source.include")} array of ${white().bold("jsdoc.json")}`
        },
        destination: {
            message: `${yellow().bold("opts.destination")} must be equal to ${green().bold("./jsdoc/")}`
        },
        missingPackage(name) {
            return `jsdoc template npm package ${cyan().bold(name)} is missing from the devDependencies of the project!`;
        }
    },
    travis: {
        error(err) {
            return `Error detected (${red().bold(err)})`;
        },
        invalidRange(range) {
            return `required Node.js engine version must respect the package.json range which is ${cyan().bold(range)}`;
        }
    },
    readme: {
        requiredSections(sections) {
            return [
                "file must contain the following titles:\n",
                `${sections.join("\n ")}\n`
            ];
        },
        requiredUsageSection: `must contain the ${cyan().bold("Usage example")} section because your project is a Package.`,
        missingBadges(diff) {
            return {
                message: `Some badges are missing: ${diff.map((value) => yellow().bold(value)).join(", ")}`,
                description: toBox(`Badges can be downloaded and configured with ${green().bold("https://shields.io/")}`)
            };
        }
    },
    package: {
        badScriptValue(key, value) {
            return `script ${cyan().bold(key)} must contain the following statement "${green().bold(value)}"`;
        },
        missingScript(scriptName) {
            return `missing script ${cyan().bold(scriptName)}`;
        },
        missingRequiredDep(type, depName) {
            return `missing required ${green().bold(type.toUpperCase())} dependency ${cyan().bold(depName)}`;
        },
        missingDevDependencies(depName) {
            return `missing required devDependencies ${cyan().bold(depName)}`;
        },
        missingRootProperty(propertyName) {
            return `root property ${cyan().bold(propertyName)} is missing`;
        },
        propertyValue(propertyName, expectedValue) {
            if (typeof expectedValue !== "undefined") {
                return `root property ${cyan().bold(propertyName)} must be equal to ${green().bold(expectedValue)}`;
            }

            return `root property ${cyan().bold(propertyName)} must not be empty`;
        },
        engines: {
            message: `${cyan().bold("engines")} root property is not configured as expected!`,
            description: toBox(objToString({ engines: { node: ">=12" } }))
        },
        nycPropertyRequired: {
            message: `root property ${cyan().bold("nyc")} is required to configure the coverage`,
            description: toBox(`you may need to remove the package if you'r not using nyc for coverage (you may use c8 or jest).\nIn case you need to configure nyc, the following config should do the job:\n\n${NYC_CONFIG}`)
        }
    },
    env: `file is required for ${cyan().bold("Service")} projects`,
    dotenv: `dotenv package is required (as devDependencies) for ${cyan().bold("Service")} projects`,
    cliGlobal: `Package.json '${cyan().bold("preferGlobal")}' key is '${red("DEPRECATED")}' (please remove)`,
    versionDiff: "Package version must be the same as SlimIO Manifest version",
    exportAddon: "Addon main file must export an instanceof @slimio/addon",
    nameDiff: "Addon name and SlimIO Manifest name must equal",
    benchmark: "folder doesn't exist but he's optionnal (to measure project performance)",
    missingDep(depName) {
        return `Missing runtime dependency "${yellow().bold(depName)}" in package.json`;
    },
    unusedDep(depName) {
        return `unused dependency ${cyan().bold(depName)}`;
    },
    binNotExist: [
        `${yellow().bold("CLI STRUCTURE")}`,
        "",
        `Your project is a CLI and must contain a ${yellow().bold("./bin folder")}`,
        `with a ${yellow().bold("./bin/index.js file")} !!`,
        ""
    ],
    docs: "folder doesn't exist but he's optionnal (documentation and / or specification of the project)",
    fileNotExist: "file doesn't exist in your current working directory.",
    gitEnv: `file is present in your main directory and must be present in ${yellow().bold(".gitignore")} file`,
    gitExist: "file must exist in your main directory",
    indexJsNotExist: `Unable to found ${yellow().bold("index.js file")} to ${yellow().bold("./bin folder")}`,
    infos: [
        `${cyan().bold(": If you want exlude or include files of cheking process, use the following commands :")}`,
        "",
        `${cyan().bold("psp ex <fileName>")}`,
        `${cyan().bold("psp in <fileName>")}`,
        ""
    ],
    manifest: [
        `You must install the slimio manifest - ${yellow().bold("npm i @slimio/manifest")} !`,
        "",
        `${red(".toml")} file must be created`,
        "at the root of the project to determine if",
        "your application is CLI or N-API. Go to this",
        "link to install this file :",
        `${cyan().bold("==> https://github.com/SlimIO/Manifest")}`,
        ""
    ],
    napiBinding: [
        `${yellow().bold("N-API STRUCTURE")}`,
        "",
        `Your project structure is a ${yellow().bold("N-API")} and your main directory`,
        `must contain a ${yellow().bold("binding.gyp")} file !`,
        ""
    ],
    napiExceptions: `N-API projects must include '${cyan().bold("NAPI_DISABLE_CPP_EXCEPTIONS")}' in binding.gyp definitions`,
    napiInclude: [
        `${yellow().bold("N-API STRUCTURE")}`,
        "",
        `Your project structure is a ${yellow().bold("N-API")} and your main directory`,
        `must contain a ${yellow().bold("include")} folder !`,
        ""
    ],
    npmEnv: `file is present in your main directory and must be present in ${yellow().bold(".npmignore")} file`,
    ignoreDir: "directory has been detected has a non-standard directory!",
    pkgEngines: [
        `${yellow().bold("engines")} field in package.json file must be equal to:`,
        "",
        "\"engines\": {",
        "   \"node\": \">=12\"",
        "}",
        ""
    ],
    pkgHusky: [
        `${white().bold("husky.hooks")} is not configured as expected`,
        toBox(objToString({
            husky: {
                hooks: {
                    "pre-push": "cross-env eslint index.js && npm test",
                    "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
                }
            }
        }))
    ],
    pkgPrepush: `pre-push husky hook in package.json must include the keywords '${cyan().bold("eslint")}' and '${cyan().bold("npm test")}'`,
    rootFieldsCLI: [
        "Your project has been detected as a CLI, but no 'bin' field detected in your package.json",
        "",
        "\"bin\": {",
        `   "${red("yourAppName")}": "${green("./bin/index.js")}"`,
        "}",
        "",
        `${cyan().bold("==> See documentation to https://docs.npmjs.com/files/package.json#bin")}`,
        ""
    ],
    rootFieldsNAPI: [
        `${green("N-API project:")} ${yellow().bold("think to add following properties to your package.json")}`,
        "",
        `"gypfile": ${green(true)},`,
        ""
    ],
    shebang: `The ${yellow().bold("index.js file")} must contain => #!/usr/bin/env node <= to first line`,
    src: "folder doesn't exist in your main directory (Mandatory folder).",
    test: "folder doesn't exist ! He is required to test your project.",
    pubNoMatch(pattern) {
        return `unable to match local file or path '${cyan().bold(pattern)}' from the package.json whitelist (files)`;
    }
};

module.exports = messages;

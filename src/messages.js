"use strict";

// Require Third-party Dependencies
const { green, yellow, cyan, red } = require("kleur");

const messages = {
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
        return `Unused dependency "${yellow().bold(depName)}" in package.json`;
    },
    travis(err) {
        return `Error detected (${cyan().bold(err)})`;
    },
    binNotExist: [
        `${yellow().bold("CLI STRUCTURE")}`,
        "",
        `Your project is a CLI and must contain a ${yellow().bold("./bin folder")}`,
        `with a ${yellow().bold("./bin/index.js file")} !!`,
        ""
    ],
    commitLint: "file must be extended by @commitlint/config-conventional",
    docs: "folder doesn't exist but he's optionnal (documentation and / or specification of the project)",
    editorConf: [
        "file doesn't match our local copy.",
        "",
        `Please use the following command: ${cyan().bold("psp --editorconfig")} to get more informations`,
        ""
    ],
    eslintAdd: "file contains more than 2 keys (non-standard configuration)",
    eslintExtends: "file must be extended by the package '@slimio/eslint-config'",
    eslintRulesKey(listLines) {
        return [
            "file contain a 'rules' object (think about checking their validity / usefulness).",
            "",
            `${listLines.join("\n|   ")}`,
            ""
        ];
    },
    fileNotExist: "file doesn't exist in your current working directory.",
    gitEnv: `file is present in your main directory and must be present in ${yellow().bold(".gitignore")} file`,
    gitExist: "file must exist in your main directory",
    gitignore(listLines) {
        return [
            "file doesn't contains right files/directories.",
            "",
            `${listLines.join("\n|   ")}`,
            "",
            `Please use the following command: ${cyan().bold("psp --gitignore")} to get more informations`,
            ""
        ];
    },
    indexJsNotExist: `Unable to found ${yellow().bold("index.js file")} to ${yellow().bold("./bin folder")}`,
    infos: [
        `${cyan().bold(": If you want exlude or include files of cheking process, use the following commands :")}`,
        "",
        `${cyan().bold("psp ex <fileName>")}`,
        `${cyan().bold("psp in <fileName>")}`,
        ""
    ],
    jsdoc: `is missing in the ${yellow().bold("jsdoc.json")} of ${yellow().bold("include")} field`,
    jsdocDestination: `jsdoc config ${cyan().bold("opts.destination")} must be equal to ${yellow().bold("./jsdoc/")}`,
    jsdocTheme(name) {
        return `missing jsdoc template '${cyan().bold(name)}' package in devDependencies!`;
    },
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
    npmignore(listLines) {
        return [
            "file doesn't contains right files/directories:",
            "",
            `${listLines.join("\n|   ")}`,
            "",
            `Please use the following command: ${cyan().bold("psp --npmignore")} to get more informations`,
            ""
        ];
    },
    // eslint-disable-next-line
    npmrc: `contain the rule '${yellow().bold("package-lock=false")}' but ${yellow().bold("package-lock.json")} is present at the root of the project`,
    ignoreDir: "directory has been detected has a non-standard directory!",
    pkgDep(typeOfProject, key1, key2) {
        const type = yellow().bold(typeOfProject);
        const dep = yellow().bold("dependencies");

        return [
            `Your project is a ${type} and Package.json must contain a "${dep}" property:`,
            "",
            `"${yellow().bold(key1)}"`,
            `"${yellow().bold(key2)}"`,
            ""
        ];
    },
    pkgDevDep(keyDepDev) {
        return `file must contain for "${yellow().bold("devDependencies")}" key, the "${yellow().bold(keyDepDev)}" property`;
    },
    pkgEngines: [
        `${yellow().bold("engines")} field in package.json file must be equal to:`,
        "",
        "\"engines\": {",
        "   \"node\": \">=10\"",
        "}",
        ""
    ],
    pkgHusky: [
        `${yellow().bold("husky")} field in package.json file must be equal to:`,
        "",
        "\"husky\": {",
        "   \"hooks\": {",
        "      \"pre-push\": \"cross-env eslint index.js && npm test\"",
        "      \"commit-msg\": \"commitlint -E HUSKY_GIT_PARAMS\"",
        "    }",
        "}",
        ""
    ],
    // eslint-disable-next-line
    pkgPrepush: `pre-push husky hook in package.json must include the keywords '${cyan().bold("eslint")}' and '${cyan().bold("npm test")}'`,
    // eslint-disable-next-line
    pkgNyc: `if you use ${yellow().bold("nyc")} dependencies, ${yellow().bold("package.json")} file must contain a ${yellow().bold("nyc")} field`,
    pkgOthers(keyOthers) {
        return `file must contain "${yellow().bold(keyOthers)}" property`;
    },
    pkgOthersCtn(keyName, ctn) {
        if (ctn !== undefined) {
            return `${yellow().bold(keyName)} property in package.json must be equal to ${yellow().bold(ctn)}`;
        }

        return `${yellow().bold(keyName)} property in package.json must not be empty`;
    },
    pkgValue(key, value) {
        const pkg = yellow().bold("package.json");

        return `${pkg} script "${yellow().bold(key)}" must be equal to "${cyan().bold(value)}"`;
    },
    pkgScripts(typeOfProject, keyScript) {
        const type = yellow().bold(typeOfProject);
        const key = yellow().bold(keyScript);
        const scr = yellow().bold("script");
        const pkg = yellow().bold("package.json");

        return `Your project is a ${type} and ${pkg} must contain the "${key}" ${scr}`;
    },
    readme(listLines) {
        return [
            "file must contain the following titles :",
            "",
            `${listLines.join("\n|   ")}`,
            ""
        ];
    },
    readmeEx: `file must contain ${yellow().bold("Usage example")} because your project is a Package.`,
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
    test: "folder doesn't exist ! He is required to test your project."
};

module.exports = messages;

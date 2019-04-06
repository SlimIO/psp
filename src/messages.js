// Require Third-party Dependencies
const { green, yellow, cyan, red } = require("kleur");

const messages = {
    benchmark: "folder doesn't exist but he's optionnal (to measure project performance)",
    binNotExist: [
        `${yellow("CLI STRUCTURE")}`,
        "",
        `Your project is a CLI and must contain a ${yellow("./bin folder")}`,
        `with a ${yellow("./bin/index.js file")} !!`,
        ""
    ],
    commitLint: "file must be extended by @commitlint/config-conventional",
    docs: "folder doesn't exist but he's optionnal (documentation and / or specification of the project)",
    editorConf: [
        "file doesn't match our local copy.",
        "",
        `Please use the following command: ${cyan("psp .editorconfig")} to get more informations`,
        ""
    ],
    eslintExtends: "file must be extended by the package '@slimio/eslint-config'",
    eslintRulesKey: "file contain a 'rules' object (think about checking their validity / usefulness).",
    fileNotExist: "file doesn't exist in your current working directory.",
    gitEnv: `file is present in your main directory and must be present in ${yellow(".gitignore")} file`,
    gitExist: "file must exist in your main directory",
    gitignore(listLines) {
        return [
            "file doesn't contains right files/directories.",
            "",
            `${listLines.join("\n|   ")}`,
            "",
            `Please use the following command: ${cyan("psp .gitignore")} to get more informations`,
            ""
        ];
    },
    indexJsNotExist: `Unable to found ${yellow("index.js file")} to ${yellow("./bin folder")}`,
    infos: [
        `${cyan(": If you want exlude or include files of cheking process, use the following commands :")}`,
        "",
        `${cyan("psp ex <fileName>")}`,
        `${cyan("psp in <fileName>")}`,
        ""
    ],
    jsdoc: `is missing in the ${yellow("jsdoc.json")} of ${yellow("include")} field`,
    manifest: [
        `You must install the slimio manifest - ${yellow("npm i @slimio/manifest")} !`,
        "",
        `${red(".toml")} file must be created`,
        "at the root of the project to determine if",
        "your application is CLI or N-API. Go to this",
        "link to install this file :",
        `${cyan("==> https://github.com/SlimIO/Manifest")}`,
        ""
    ],
    napiBinding: [
        `${yellow("N-API STRUCTURE")}`,
        "",
        `Your project structure is a ${yellow("N-API")} and your main directory`,
        `must contain a ${yellow("binding.gyp")} file !`,
        ""
    ],
    napiInclude: [
        `${yellow("N-API STRUCTURE")}`,
        "",
        `Your project structure is a ${yellow("N-API")} and your main directory`,
        `must contain a ${yellow("include")} folder !`,
        ""
    ],
    npmEnv: `file is present in your main directory and must be present in ${yellow(".npmignore")} file`,
    npmignore(listLines) {
        return [
            "file doesn't contains right files/directories:",
            "",
            `${listLines.join("\n|   ")}`,
            "",
            `Please use the following command: ${cyan("psp .npmignore")} to get more informations`,
            ""
        ];
    },
    npmrc: `contain the rule '${yellow("package-lock=false")}' but ${yellow("package-lock.json")} is present at the root of the project`,
    ignoreDir: "directory has been detected has a non-standard directory!",
    pkgDep(typeOfProject, key1, key2) {
        const type = yellow(typeOfProject);
        const dep = yellow("dependencies");
        const pkg = yellow("package.json");

        return [
            `Your project is a ${type} type and ${pkg} must content for "${dep}" key :`,
            "",
            `"${yellow(key1)}"`,
            `"${yellow(key2)}"`,
            ""
        ];
    },
    pkgDevDep(keyDepDev) {
        return `file must content for "${yellow("devDependencies")}" key, the "${yellow(keyDepDev)}" property`;
    },
    pkgEngines: [
        `${yellow("engines")} field in package.json file must be equal to:`,
        "",
        "\"engines\": {",
        "   \"node\": \">=10\"",
        "}",
        ""
    ],
    pkgHusky: [
        `${yellow("husky")} field in package.json file must be equal to:`,
        "",
        "\"husky\": {",
        "   \"hooks\": {",
        "      \"commit-msg\": \"commitlint -E HUSKY_GIT_PARAMS\"",
        "    }",
        "}",
        ""
    ],
    pkgNyc: `if you use ${yellow("nyc")} dependencies, ${yellow("package.json")} file must contain a ${yellow("nyc")} field`,
    pkgOthers(keyOthers) {
        return `file must contain "${yellow(keyOthers)}" property`;
    },
    pkgOthersCtn(keyName, ctn) {
        if (ctn !== undefined) {
            return `${yellow(keyName)} of package.json mustn't be equal at ${yellow(ctn)}`;
        }

        return `${yellow(keyName)} of package.json mustn't be void`;
    },
    pkgScripts(typeOfProject, keyScript) {
        const type = yellow(typeOfProject);
        const key = yellow(keyScript);
        const scr = yellow("script");
        const pkg = yellow("package.json");

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
    readmeEx: `file must content ${yellow("Usage example")} because your project is a Package.`,
    rootFieldsCLI: [
        `${green("CLI project ==>")} ${yellow("Into your package.json, think about :")}`,
        "",
        `"main": "${green("./bin/index.js")}"`,
        `"preferGlobal": ${green(true)},`,
        "\"bin\": {",
        `   "${red("yourAppName")}": "${green("./bin/index.js")}"`,
        "}",
        "",
        `${cyan("==> See documentation to https://docs.npmjs.com/files/package.json#bin")}`,
        ""
    ],
    rootFieldsNAPI: [
        `${green("N-API project:")} ${yellow("think to add following properties to your package.json")}`,
        "",
        `"gypfile": ${green(true)},`,
        ""
    ],
    shebang: `The ${yellow("index.js file")} must contain => #!/usr/bin/env node <= to first line`,
    src: "folder doesn't exist in your main directory (Mandatory folder).",
    test: "folder doesn't exist and is required to test your application."
};

module.exports = messages;

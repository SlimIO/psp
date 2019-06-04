// Require Third-party Dependencies
const { green, yellow, cyan, red } = require("kleur");

const messages = {
    env: `file is required for ${cyan("Service")} projects`,
    dotenv: `dotenv package is required (as devDependencies) for ${cyan("Service")} projects`,
    cliGlobal: `Package.json '${cyan("preferGlobal")}' key is '${red("DEPRECATED")}' (please remove)`,
    versionDiff: "Package version must be the same as SlimIO Manifest version",
    exportAddon: "Addon main file must export an instanceof @slimio/addon",
    nameDiff: "Addon name and SlimIO Manifest name must equal",
    benchmark: "folder doesn't exist but he's optionnal (to measure project performance)",
    missingDep(depName) {
        return `Missing runtime dependency "${yellow(depName)}" in package.json`;
    },
    unusedDep(depName) {
        return `Unused dependency "${yellow(depName)}" in package.json`;
    },
    travis(err) {
        return `Error detected (${cyan(err)})`;
    },
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
        `Please use the following command: ${cyan("psp --editorconfig")} to get more informations`,
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
    gitEnv: `file is present in your main directory and must be present in ${yellow(".gitignore")} file`,
    gitExist: "file must exist in your main directory",
    gitignore(listLines) {
        return [
            "file doesn't contains right files/directories.",
            "",
            `${listLines.join("\n|   ")}`,
            "",
            `Please use the following command: ${cyan("psp --gitignore")} to get more informations`,
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
    jsdocDestination: `jsdoc config ${cyan("opts.destination")} must be equal to ${yellow("./jsdoc/")}`,
    jsdocTheme(name) {
        return `missing jsdoc template '${cyan(name)}' package in devDependencies!`;
    },
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
    napiExceptions: `N-API projects must include '${cyan("NAPI_DISABLE_CPP_EXCEPTIONS")}' in binding.gyp definitions`,
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
            `Please use the following command: ${cyan("psp --npmignore")} to get more informations`,
            ""
        ];
    },
    // eslint-disable-next-line
    npmrc: `contain the rule '${yellow("package-lock=false")}' but ${yellow("package-lock.json")} is present at the root of the project`,
    ignoreDir: "directory has been detected has a non-standard directory!",
    pkgDep(typeOfProject, key1, key2) {
        const type = yellow(typeOfProject);
        const dep = yellow("dependencies");

        return [
            `Your project is a ${type} and Package.json must contain a "${dep}" property:`,
            "",
            `"${yellow(key1)}"`,
            `"${yellow(key2)}"`,
            ""
        ];
    },
    pkgDevDep(keyDepDev) {
        return `file must contain for "${yellow("devDependencies")}" key, the "${yellow(keyDepDev)}" property`;
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
            return `${yellow(keyName)} property in package.json must be equal to ${yellow(ctn)}`;
        }

        return `${yellow(keyName)} property in package.json must not be empty`;
    },
    pkgValue(key, value) {
        const pkg = yellow("package.json");

        return `${pkg} script "${yellow(key)}" must be equal to "${cyan(value)}"`;
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
    readmeEx: `file must contain ${yellow("Usage example")} because your project is a Package.`,
    rootFieldsCLI: [
        "Your project has been detected as a CLI, but no 'bin' field detected in your package.json",
        "",
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
    test: "folder doesn't exist ! He is required to test your project."
};

module.exports = messages;

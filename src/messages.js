const { green, yellow, cyan, red } = require("kleur");
const emoji = require("node-emoji");

const messages = {
    benchmark: "folder doesn't exist but he's optionnal (To measure project performance)",
    binNotExist: `${yellow("CLI STRUCTURE")}
|    
|   Your project is a CLI and must content a ${yellow("bin folder")} 
|   with a ${yellow("index.js file")} !!
|`,
    commitLint: "file must be extends by @commitlint/config-conventional",
    docs: "folder doesn't exist but he's optionnal (documentation and / or specification of the project)",
    // eslint-disable-next-line max-len
    editorConf: `file doesn't contains the good informations.
|
|         You should used ${cyan("psp .editorconfig")} to see exact informations
|`,
    eslintExtends: "file must be extends by @slimio/eslint-config.",
    eslintRulesKey: "file contains a 'rules' field (specifics rules !).",
    fileNotExist: "file doesn't exist in your main directory.",
    gitEnv: `file is present in your main directory and must be present in ${yellow(".gitignore")} file`,
    gitignore(listLines) {
        return `file doesn't contains the good informations.
|
|   ${listLines.join("\n|   ")}
|
|   You should used ${cyan("psp .gitignore")} to see exact informations
|`;
    },
    indexJsNotExist: `Impossible to found ${yellow("index.js file")} to ${yellow("bin folder")}`,
    infos: `|
| ${emoji.get(":bulb:")}  ${cyan(": If you want exlude or include files of cheking process, use the following commands :")}
|
|   ${cyan("psp ex <fileName>")}
|   ${cyan("psp in <fileName>")}
|`,
    jsdoc: `is missing in the ${yellow("jsdoc.json")} of ${yellow("include")} field`,
    manifest: `You must install the slimio manifest - ${green("npm i @slimio/manifest")} !
|
|   ${green(".toml")} file must be created 
|   at the root of the project to determine if 
|   your application is CLI or N-API. Go to this 
|   link to install this file :
|   ${cyan("==> https://github.com/SlimIO/Manifest")}    
|`,
    napiBinding: `${yellow("N-API STRUCTURE")}
|
|   Your project structure is a ${yellow("N-API")} and your main directory 
|   must content a ${yellow("binding.gyp")} file !
|`,
    napiInclude: `${yellow("N-API STRUCTURE")}
|
|   Your project structure is a ${yellow("N-API")} and your main directory 
|   must content a ${yellow("include")} folder !
|`,
    npmEnv: `file is present in your main directory and must be present in ${yellow(".npmignore")} file`,
    npmignore(listLines) {
        return `file doesn't contains the good informations.
|
|   ${listLines.join("\n|   ")}
|
|   You should used ${cyan("psp .npmignore")} to see exact informations
|`;
    },
    npmrc: `file contains ${yellow("package-lock=false")} and ${yellow("package-lock.json")} is present in your project`,
    pkgDep(typeOfProject, key1, key2) {
        // eslint-disable-next-line max-len
        return `Your project is ${yellow(typeOfProject)} type and ${green("package.json")} must content for "${green("dependencies")}" key : 
|        
|   "${yellow(key1)}"
|   "${yellow(key2)}"       
|`;
    },
    pkgDevDep(keyDepDev) {
        return `file must content for "${green("devDependencies")}" key, the "${yellow(keyDepDev)}" property`;
    },
    pkgEngines: `${green("engines")} field in package.json file must be following content :
|
|   "engines": {
|       "node": ">=10"
|   }
|`,
    pkgHusky: `${green("husky")} field in package.json file must be following content :
|
|   "husky": {
|       "hooks": {
|       "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
|       }
|   }
|`,
    pkgNyc: `if you use ${yellow("nyc")} dependencies, ${green("package.json")} file must content a ${yellow("nyc")} field`,
    pkgOthers(keyOthers) {
        return `file must content "${yellow(keyOthers)}" property`;
    },
    pkgOthersCtn(keyName, ctn) {
        if (ctn !== undefined) {
            return `${green(keyName)} of package.json mustn't be equal at ${yellow(ctn)}`;
        }

        return `${green(keyName)} of package.json mustn't be void`;
    },
    pkgScripts(typeOfProject, keyScript) {
        // eslint-disable-next-line max-len
        return `Your project is ${yellow(typeOfProject)} type and ${green("package.json")} must content for "${green("scripts")}" key, the "${yellow(keyScript)}" property`;
    },
    readme: `file must content following titles :
|
|   ## Requirements
|   ## Getting Started
|   ## API
|   ## License
|`,
    readmeEx: `file must content ${yellow("Usage example")} because your project is a Package.`,
    rootFieldsCLI: `|
| ${emoji.get(":bulb:")}  : ${green("CLI project ==>")} ${yellow("Into your package.json, think about :")}
|
|   "main": "${green("./bin/index.js")}"    
|   "preferGlobal": ${green(true)},
|   "bin": {
|      "${red("yourAppName")}": "${green("./bin/index.js")}"
|   }
|   ${cyan("==> See documentation to https://docs.npmjs.com/files/package.json#bin")}
|`,
    rootFieldsNAPI: `|
| ${emoji.get(":bulb:")}  : ${green("N-API project ==>")} ${yellow("Into your package.json, think about :")}
|       
|   "gypfile": ${green(true)},
|`,
    shebang: `The ${yellow("index.js file")} must content => #!/usr/bin/env node <= to first line`,
    src: "folder doesn't exist in your main directory. Obligatory folder for your sources !",
    test: "folder doesn't exist and is necessary to test your application."
};

module.exports = messages;

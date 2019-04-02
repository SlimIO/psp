const { green, yellow, cyan } = require("kleur");
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
    env: `file is present in your main directory and must be present in ${yellow(".npmignore")} file`,
    editorConf: "file isn't identical to SlimIO projects.",
    eslintExtends: "file must be extends by @slimio/eslint-config.",
    eslintRulesKey: "file contains a 'rules' field (specifics rules !).",
    fileNotExist: "file doesn't exist in your main directory.",
    indexJsNotExist: `Impossible to found ${yellow("index.js file")} to ${yellow("bin folder")}`,
    infos: `|
| ${emoji.get(":bulb:")}  ${cyan(": If you want exlude or include files of cheking process, use the following commands :")}
|
|   ${cyan("psp ex <fileName>")}
|   ${cyan("psp in <fileName>")}
|`,
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
    npmignore: `file must contains at least the following elements :
|
|   test/
|   tests/
|   coverage/
|   .nyc_output/
|   .circleci/
|   docs/
|   jsdoc/
|   jsdoc.json
|   .editorconfig
|   .eslintrc
|   .gitignore
|   tsconfig.json
|   commitlint.config.js
|   .env
|   .travis.yml
|   CONTRIBUTING.md
|   CHANGELOG.md
|`,
    npmrc: `file contains ${yellow("package-lock=false")} and ${yellow("package-lock.json")} is present in your project`,
    readme: `file must contants following titles :
|
|   Requirements
|   Getting Started
|   API
|   License
|`,
    readmeEx: `file must content ${yellow("Usage example")} because your project is a Package.`,
    rootFieldsCLI: `|
| ${emoji.get(":bulb:")}  : ${green("CLI project ==>")} ${yellow("Into your package.json, think about :")}
|
|     "main": "${green("./bin/index.js")}"    
|     "preferGlobal": ${green(true)},
|     "bin": {
|        "yourAppName": "${green("./bin/index.js")}"
|     }
|     ${cyan("==> See documentation to https://docs.npmjs.com/files/package.json#bin")}
|`,
    rootFieldsNAPI: `|
| ${emoji.get(":bulb:")}  : ${green("N-API project ==>")} ${yellow("Into your package.json, think about :")}
|       
|     "gypfile": ${green(true)},
|`,
    shebang: `The ${yellow("index.js file")} must content => #!/usr/bin/env node <= to first line`,
    src: "folder doesn't exist in your main directory. Obligatory folder for your sources !",
    test: "folder doesn't exist and is necessary to test your application."
};

module.exports = messages;

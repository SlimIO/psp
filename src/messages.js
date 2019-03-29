const { green, yellow, cyan } = require("kleur");
const emoji = require("node-emoji");

const messages = {
    eslintExtends: "file must be extends by @slimio/eslint-config.",
    eslintRulesKey: "file contains a 'rules' field (specifics rules !).",
    editorConf: "file isn't identical to SlimIO projects.",
    commitLint: "file must be extends by @commitlint/config-conventional",
    fileNotExist: "file doesn't exist in your main directory.",
    src: "folder doesn't exist in your main directory. Obligatory folder for your sources !",
    test: "folder doesn't exist and is necessary to test your application.",
    benchmark: "folder doesn't exist but he's optionnal (To measure project performance)",
    docs: "folder doesn't exist but he's optionnal (documentation and / or specification of the project)",
    shebang: `The ${yellow("index.js file")} must content => #!/usr/bin/env node <= to first line`,
    indexJsNotExist: `Impossible to found ${yellow("index.js file")} to ${yellow("bin folder")}`,
    binNotExist: `${yellow("CLI STRUCTURE")}
|    
|   Your project is a CLI and must content a ${yellow("bin folder")} 
|   with a ${yellow("index.js file")} !!
|----`,
    rootFieldsCLI: `|----
| ${emoji.get(":bulb:")}  : ${green("CLI project ==>")} ${yellow("Into your package.json, think about :")}
|
|     "main": "${green("./bin/index.js")}"    
|     "preferGlobal": ${green(true)},
|     "bin": {
|        "yourAppName": "${green("./bin/index.js")}"
|     }
|     ${cyan("==> See documentation to https://docs.npmjs.com/files/package.json#bin.")}
|----`,
    manifest: `You must install the slimio manifest - ${green("npm i @slimio/manifest")} !
|
|   ${green(".toml")} file must be created 
|   at the root of the project to determine if 
|   your application is CLI or N-API. Go to this 
|   link to install this file :
|   ${cyan("==> https://github.com/SlimIO/Manifest")}    
|----`,
    napiInclude: `${yellow("N-API STRUCTURE")}
|
|   Your project structure is a ${yellow("N-API")} and your main directory 
|   must content a ${yellow("include")} folder !
|----`,
    napiBinding: `${yellow("N-API STRUCTURE")}
|
|   Your project structure is a ${yellow("N-API")} and your main directory 
|   must content a ${yellow("binding.gyp")} file !
|----`,
    rootFieldsNAPI: `|----
| ${emoji.get(":bulb:")}  : ${green("N-API project ==>")} ${yellow("Into your package.json, think about :")}
|       
|     "gypfile": ${green(true)},
|----`
};

module.exports = messages;

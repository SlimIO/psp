const { green, yellow } = require("kleur");

const messages = {
    eslintExtends: "must be extends by @slimio/eslint-config.",
    eslintRulesKey: "contains a 'rules' field (specifics rules !).",
    editorConf: "isn't identical to SlimIO projects.",
    commitLint: "must be extends by @commitlint/config-conventional",
    NotExist: "doesn't exist in your main directory.",
    shebang: `The ${yellow("index.js file")} must content => #!/usr/bin/env node <= to first line`,
    indexJsNotExist: `Impossible to found ${yellow("index.js file")} to ${yellow("bin folder")}`,
    binNotExist: `Your project is a CLI and must content a ${yellow("bin folder")} with a ${yellow("index.js file")} !`,
    rootFields: `|
|        ${yellow("Into your package.json, think about :")}
|        
|        "preferGlobal": true,
|
|        "bin": {
|            "yourAppName": "./bin/index.js"
|        }
|        See documentation to https://docs.npmjs.com/files/package.json#bin.
|
|        main: ./bin/index.js
|    `,
    manifest: `| You must install the slimio manifest - ${green("npm i @slimio/manifest")}
|    
|        ${green(".toml")} file must be created 
|        at the root of the project to determine if 
|        your application is CLI or N-API. Go to this 
|        link to install this file :
|        https://github.com/SlimIO/Manifest
|        
|    `
};

module.exports = messages;

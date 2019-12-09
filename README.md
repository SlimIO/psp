# Project structure policy
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/psp/master/package.json&query=$.version&label=Version)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![dep](https://img.shields.io/david/SlimIO/psp.svg)
![size](https://img.shields.io/github/languages/code-size/SlimIO/psp.svg)
[![Known Vulnerabilities](https://snyk.io/test/github/SlimIO/psp/badge.svg?targetFile=package.json)](https://snyk.io/test/github/SlimIO/psp?targetFile=package.json)
[![Build Status](https://travis-ci.com/SlimIO/psp.svg?branch=master)](https://travis-ci.com/SlimIO/psp)
[![Greenkeeper badge](https://badges.greenkeeper.io/SlimIO/psp.svg)](https://greenkeeper.io/)

SlimIO - Project Structure Policy. A policy aims to accurately describe the constituent elements of a project. This CLI has been created to apply the following [Specification](https://docs.google.com/document/d/163Fb4HufSck27VW1ZWeEoDPPKGCnVKBo-6Zxbt2Bj64/edit?usp=sharing).

> ⚠️ This project has been created for SlimIO (it will not work outside). Feel free to replicate the idea / core concept.

<p align="center">
    <img src="https://i.imgur.com/6noO5ti.png" height="400">
</p>

## Requirements
- [Node.js](https://nodejs.org/en/) v12 or higher
- a [SlimIO Manifest](https://github.com/SlimIO/Manifest) file at the root of the scanned project.

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/psp
# or
$ yarn add @slimio/psp
```

## Usage example
When installed globally the **psp** executable will be exposed in your terminal.
```bash
$ psp
```

If you want to continue the execution even for critical warnings, just run with **force** mode:
```bash
$ psp --force
```

### Arguments

| name | description |
| --- | --- |
| -h --help | Show help |
| --force | Enable force mode |
| --gitignore | Show .gitignore file |
| --npmignore | Show .npmignore file |
| --editorconfig | Show .editorconfig file |

## API
PSP is available in API mode too.

```js
const psp = require("@slimio/psp");

async function main() {
    const { warn, crit } = await psp({
        forceMode: true, // <-- stay to true (else it will exit the process on CRIT).
        CWD: "./dir",
        isCLI: false, // <-- stay to false (else it will work as it was executed as a CLI).
        verbose: false
    });
    console.log(`warn => ${warn}, crit => ${crit}`);
}
main().catch(console.error);
```

## Get a global overview of many projects
The [SlimIO Sync](https://github.com/SlimIO/Sync) project allow to run a command to get a global overview of warnings of all projects in the current working dir.

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@slimio/is](https://github.com/SlimIO/is)|Minor|Low|JavaScript Type checker|
|[@slimio/manifest](https://github.com/SlimIO/Manifester#readme)|Minor|Low|SlimIO Manifest manager|
|[boxen](https://github.com/sindresorhus/boxen#readme)|Minor|High|TBC|
|[estree-walker](https://github.com/Rich-Harris/estree-walker#readme)|⚠️Major|Low|Simple utility for walking an ESTree-compliant AST|
|[file-ignore-parser](https://github.com/fraxken/file-ignore-parser#readme)|Minor|Low|Parse .ignore file|
|[file-normalize](https://github.com/jonschlinkert/file-normalize)|⚠️Major|Low|File normalizer|
|[globby](https://github.com/sindresorhus/globby#readme)|Minor|High|TBC|
|[js-yaml](https://github.com/nodeca/js-yaml)|⚠️Major|Low|YAML parser/writer|
|[kleur](https://github.com/lukeed/kleur#readme)|Minor|Low|color for TTY|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|⚠️Major|Low|Force Node.js [DEP00018](https://nodejs.org/dist/latest-v8.x/docs/api/deprecations.html#deprecations_dep0018_unhandled_promise_rejections)|
|[marked](https://marked.js.org)|Minor|Low|TBC|
|[meriyah](https://github.com/meriyah/meriyah)|Minor|Low|TBC|
|[sade](https://github.com/lukeed/sade#readme)|Minor|Low|Sade is a small but powerful tool for building command-line interface (CLI) applications for Node.js that are fast, responsive, and helpful!|
|[semver](https://github.com/npm/node-semver)|⚠️Major|Low|Semver parser/utilities for node|

## License
MIT

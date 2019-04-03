# Project structure policy
![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

SlimIO - Project structure policy. This project is in progress production to help SlimIO contributors to describe all elements and structures of a project

## Requirements
- Node.js v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/psp
# or
$ yarn add @slimio/psp
```

## Usage example
TBC

## Checked

* #### Files

name | description | Severity - checked if
---- | ---- | ----
package.json | Project manifest | :no_entry:*exist*
slimio.toml | Project Slimio [manifest](https://github.com/SlimIO/Manifest) | :no_entry:*exist*
.eslintrc | Linting configuration for JavaScript | :no_entry:*exist* :warning:*correct extends* :warning:*rules or not*
.editorconfig | Editor configuration, slimIO standard | :no_entry:*exist* :warning:*identique of the slimIO projects*
index.d.ts | Type(s) definition | :no_entry:*exist*
jsdoc.json | JSDoc configuration | :no_entry:*exist* :no_entry:*all source files*
commitlint.config.json | GIT Commit convention configuration | :no_entry:*exist*, :no_entry:*correct extends*
LICENSE | Project LICENSE (default MIT) | :no_entry:*exist*
.npmignore | Keep stuff out of your package | :no_entry:*exist*

* #### Structures

##### _Folders--_

name | description | Severity - checked if
---- | ---- | ----
/src | This folder contains project sources | :no_entry:*exist*
/test | This folder contains test files and / or folder | :warning:*exist*
/benchmark | This folder contains scripts that aim to measure project performance | :bulb:*exist*
/docs | This folder containing documentation and / or project specification | :bulb:*exist*

##### _CLI--_

name | Type | description | Severity - checked if
---- | :----: | ---- | ----
/bin | folder |

## License
MIT

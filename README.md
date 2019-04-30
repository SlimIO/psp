# Project structure policy
![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)

SlimIO - Project Structure Policy. A policy aims to accurately describe the constituent elements of a project. This CLI has been created to apply the following [Specification](https://docs.google.com/document/d/163Fb4HufSck27VW1ZWeEoDPPKGCnVKBo-6Zxbt2Bj64/edit?usp=sharing).

> ⚠️ This project has been created for SlimIO (it will not work outside). Feel free to replicate the idea / core concept.

<p align="center">
    <img src="https://i.imgur.com/6noO5ti.png" height="400">
</p>

## Requirements
- Node.js v10 or higher
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

## License
MIT

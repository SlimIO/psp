"use strict";

// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const repl = require("repl");

// Require Third-party Dependencies
const { walk } = require("estree-walker");
const meriyah = require("meriyah");

// CONSTANTS
const BINARY_EXPR_TYPES = new Set(["Literal", "BinaryExpression", "Identifier"]);
const NODE_CORE_LIBS = new Set([...repl._builtinLibs, "timers"]);

/**
 * @function isRequireStatment
 * @param {*} node
 * @returns {boolean}
 */
function isRequireStatment(node) {
    if (node.type !== "CallExpression" || node.callee.name !== "require") {
        return false;
    }

    return true;
}

/**
 * @function isImportStatment
 * @param {*} node
 * @returns {boolean}
 */
function isImportStatment(node) {
    return node.type === "ImportDeclaration";
}

/**
 * @function isVariableDeclarator
 * @param {*} node
 * @returns {boolean}
 */
function isVariableDeclarator(node) {
    if (node.type !== "VariableDeclarator" ||
        node.init === null ||
        node.init.type !== "Literal" ||
        node.id.type !== "Identifier") {
        return false;
    }

    return true;
}

/**
 * @function concatBinaryExpr
 * @param {*} node
 * @param {Map<string, any>} identifiers
 * @returns {string | null}
 */
function concatBinaryExpr(node, identifiers) {
    const { left, right } = node;
    if (!BINARY_EXPR_TYPES.has(left.type) || !BINARY_EXPR_TYPES.has(right.type)) {
        return null;
    }
    let str = "";

    for (const childNode of [left, right]) {
        switch (childNode.type) {
            case "BinaryExpression": {
                const value = concatBinaryExpr(childNode, identifiers);
                if (value !== null) {
                    str += value;
                }
                break;
            }
            case "Literal":
                str += childNode.value;
                break;
            case "Identifier":
                if (identifiers.has(childNode.name)) {
                    str += identifiers.get(childNode.name);
                }
                break;
        }
    }

    return str;
}

/**
 * @async
 * @function parseScript
 * @description Parse a script, get an AST and search for require occurence!
 * @param {!string} file file location
 * @param {Object} [options]
 * @param {boolean} [options.module=false]
 * @returns {Set<string>}
 */
async function parseScript(file, options = {}) {
    const { module = false } = options;
    const identifiers = new Map();
    const runtimeDep = new Set();

    // eslint-disable-next-line
    function addDep(value) {
        if (value.charAt(0) === "." || NODE_CORE_LIBS.has(value)) {
            return;
        }

        if (value.charAt(0) === "@") {
            runtimeDep.add(value);
        }
        else {
            runtimeDep.add(value.includes("/") ? value.split("/")[0] : value);
        }
    }

    let str = await readFile(file, { encoding: "utf8" });
    if (str.charAt(0) === "#") {
        str = str.slice(str.indexOf("\n"));
    }
    const { body } = meriyah.parseScript(str, { next: true, module });

    walk(body, {
        enter(node) {
            try {
                if (!module && isRequireStatment(node)) {
                    const arg = node.arguments[0];
                    if (arg.type === "Identifier") {
                        if (identifiers.has(arg.name)) {
                            addDep(identifiers.get(arg.name));
                        }
                    }
                    else if (arg.type === "Literal") {
                        addDep(arg.value);
                    }
                    else if (arg.type === "BinaryExpression" && arg.operator === "+") {
                        const value = concatBinaryExpr(arg, identifiers);
                        if (value !== null) {
                            addDep(value);
                        }
                    }
                }
                else if (module && isImportStatment(node)) {
                    const source = node.source;

                    if (source.type === "Literal") {
                        addDep(source.value);
                    }
                }
                else if (isVariableDeclarator(node)) {
                    identifiers.set(node.id.name, node.init.value);
                }
            }
            catch (err) {
                // Ignore
            }
        }
    });

    return runtimeDep;
}

module.exports = { parseScript };

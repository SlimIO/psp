// Require Node.js Dependencies
const { readFile } = require("fs").promises;
const repl = require("repl");

// Require Third-party Dependencies
const { walk } = require("estree-walker");
const cherow = require("cherow");

// CONSTANTS
const NODE_CORE_LIBS = new Set([...repl._builtinLibs]);

function isRequireStatment(node) {
    if (node.type !== "CallExpression" || node.callee.name !== "require") {
        return false;
    }

    return true;
}

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
 * @async
 * @func parseScript
 * @desc Parse a script, get an AST and search for require occurence!
 * @param {!String} file file location
 * @returns {Set<String>}
 */
async function parseScript(file) {
    const identifiers = new Map();
    const runtimeDep = new Set();

    const str = await readFile(file, { encoding: "utf8" });
    const { body } = cherow.parseScript(str, { next: true });

    walk(body, {
        enter(node) {
            try {
                if (isRequireStatment(node)) {
                    const arg = node.arguments[0];
                    if (arg.type === "Identifier") {
                        if (identifiers.has(arg.name)) {
                            const value = identifiers.get(arg.name);
                            // eslint-disable-next-line
                            if (value.charAt(0) === "." || NODE_CORE_LIBS.has(value)) {
                                return;
                            }
                            runtimeDep.add(value);
                        }
                    }
                    else if (arg.type === "Literal") {
                        if (arg.value.charAt(0) === "." || NODE_CORE_LIBS.has(arg.value)) {
                            return;
                        }
                        runtimeDep.add(arg.value);
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

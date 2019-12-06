"use strict";

// Require Third-party Dependencies
const kleur = require("kleur");

module.exports = {
    CRIT: kleur.red().bold("CRIT"),
    WARN: kleur.magenta().bold("WARN"),
    INFO: kleur.green().bold("INFO"),
    ARROW_UP: ":arrow_double_up:",
    ARROW_DOWN: ":arrow_double_down:",
    CROSS: ":x:",
    CHECK: ":heavy_check_mark:"
};

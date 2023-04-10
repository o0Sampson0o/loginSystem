"use strict";

module.exports.sqlEscape = function (string) {
    return string.replace(/[']/g, "''");
};
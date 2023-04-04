function sqlEscape(string) {
    return string.replace(/[']/g, "''");
}

module.exports.sqlEscape = sqlEscape;
"use strict";

const mysql = require("mysql2");
require("dotenv").config();
const { LOG, MODE } = require("./logger.js");

const sqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD
});

sqlConnection.connect(function (sqlConnectionErr) {
    if (sqlConnectionErr) {
        throw sqlConnectionErr;
    }
    LOG(MODE.suc, "mySQL connected!");
});

module.exports = sqlConnection;
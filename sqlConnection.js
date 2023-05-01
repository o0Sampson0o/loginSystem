"use strict";

const mysql = require("mysql2");
require("dotenv").config();
const { LOG, MODE } = require("./logger.js");

let sqlConnection;

module.exports = {
    connect: async function (callback) {
        sqlConnection = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: process.env.MYSQL_PASSWORD
        });

        sqlConnection.connect(function (sqlConnectionErr) {
            if (sqlConnectionErr) {
                throw sqlConnectionErr;
            }
            if (typeof callback === "function") return callback();
            LOG(MODE.suc, "mySQL connected!");
        });
    },
    getConnection: () => sqlConnection
};

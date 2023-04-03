"use strict";

const mysql = require("mysql2");
const { LOG, MODE } = require("./logger.js");
require('dotenv').config();

var sqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD
});

sqlConnection.connect(function (err) {
    if (err) throw err;
    sqlConnection.query("use loginsystem", function (err, result) {
        if (err) throw err;
    });
    LOG(MODE.suc, "database name: loginsystem connected!");
});

const functionalRoute = {
    "/": function (query, res) {
        res.writeHead(301, { Location: "./login/" });
        res.end();
    },
    "/signup/api": function (query, res) {
        const sql = `INSERT INTO users (username, password) VALUES ('${query.data.username}', '${query.data.password}')`;
        LOG(MODE.msg, `username: ${query.data.username}, password: ${query.data.password}`);
        sqlConnection.query(sql, function (err, result) {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write("username already exist");
                    LOG(MODE.war, `create error username ${query.data.username} already exist`);
                } else {
                    throw err;
                }
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write("success");
                LOG(MODE.suc, `created new user with username:${query.data.username}, password: ${query.data.password}`);
            }
            res.end();
        });
    },
    "/login/api": function (query, res) {
        const sql = `SELECT * FROM users WHERE username='${query.data.username}' and password='${query.data.password}'`;
        LOG(MODE.msg, `username: ${query.data.username}, password: ${query.data.password}`);
        sqlConnection.query(sql, function (err, result) {
            if (err) throw err;
            else {
                res.writeHead(200, { "Content-Type": "text/html" });
                if (result.length !== 0) {
                    LOG(MODE.suc, `user ${result[0].userid} logged in with username: ${result[0].username} and password: ${result[0].password}`);
                    if (result[0].username !== query.data.username) {
                        res.write("FUCK YOU.");
                    } else {
                        res.write("Logged in.");
                    }
                } else {
                    res.write("Username or password incorrect.");
                    LOG(MODE.war, `login failed with username: ${query.data.username} and password: ${query.data.password}`);
                }
            }
            res.end();
        });
    }
};

module.exports = functionalRoute;
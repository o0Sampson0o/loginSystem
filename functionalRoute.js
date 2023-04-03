"use strict";

const fs = require("fs");
const mysql = require("mysql2");
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
    console.log("database name: loginsystem connected!");
});

const functionalRoute = {
    "/": function (query, res) {
        res.writeHead(301, { Location: "./login/" });
        res.end();
    },
    "/signup/api": function (query, res) {
        var sql = `INSERT INTO users (username, password) VALUES ('${query.data.username}', '${query.data.password}')`;
        console.log(sql);
        sqlConnection.query(sql, function (err, result) {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write("username already exist");
                    console.log(`create error username ${query.data.username} already exist`);
                } else {
                    throw err;
                }
            } else {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.write("success");
                console.log(`created new user with username:${query.data.username}, password: ${query.data.password}`);
            }
            res.end();
        });
    },
    "/login/api": function (query, res) {
        var sql = `SELECT * FROM users WHERE username='${query.data.username}' and password='${query.data.password}'`;
        console.log(sql);
        sqlConnection.query(sql, function (err, result) {
            if (err) throw err;
            else {
                res.writeHead(200, { "Content-Type": "text/html" });
                if (result.length !== 0) {
                    res.write("Logged in.");
                    console.log(`user ${result[0].userid} logged in with username: ${result[0].username} and password: ${result[0].password}`);
                } else {
                    res.write("Username or password incorrect.");
                    console.log(`login failed with username: ${query.data.username} and password: ${query.data.password}`);
                }
            }
            res.end();
        });
    }
};

module.exports = functionalRoute;
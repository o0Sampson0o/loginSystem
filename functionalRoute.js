"use strict";

const mysql = require("mysql2");
const { LOG, MODE } = require("./logger.js");
require("dotenv").config();

const bcrypt = require("bcrypt");
const saltRounds = 10;

var sqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.MYSQL_PASSWORD
});

sqlConnection.connect(function (sqlConnectionErr) {
    if (sqlConnectionErr) throw sqlConnectionErr;
    sqlConnection.query("use loginsystem", function (useDataBaseSqlErr, useDataBaseSqlResult) {
        if (useDataBaseSqlErr) throw useDataBaseSqlErr;
    });
    LOG(MODE.suc, "database name: loginsystem connected!");
});

const functionalRoute = {
    "/": function (httpQuery, httpRes) {
        httpRes.writeHead(301, { Location: "./login/" });
        httpRes.end();
    },
    "/signup/api": function (httpQuery, httpRes) {
        const username = httpQuery.data.username.replace(/[']/g, "''");
        const password = httpQuery.data.password;
        bcrypt
            .genSalt(saltRounds)
            .then(salt => bcrypt.hash(password, salt))
            .then(hashedPassword => {
                const sql = `INSERT INTO users (username, userLevel, hashedPassword) VALUES ('${username}', 0, '${hashedPassword}')`;
                sqlConnection.query(sql, (sqlErr, sqlResult) => {
                    httpRes.writeHead(200, { "Content-Type": "text/html" });
                    if (sqlErr) {
                        if (sqlErr.code === "ER_DUP_ENTRY") {
                            httpRes.write("username already exist");
                            LOG(MODE.war, `create error user '${username}' already exist`);
                        } else {
                            throw sqlErr;
                        }
                    } else {
                        httpRes.write("success");
                        LOG(MODE.suc, `user '${username}' created`);
                    }
                    httpRes.end();
                });
            })
            .catch(err => {
                throw err;
            });
    },
    "/login/api": function (httpQuery, httpRes) {
        const username = httpQuery.data.username.replace(/[']/g, "''");
        const password = httpQuery.data.password;
        const sql = `SELECT * FROM users WHERE username='${username}'`;
        sqlConnection.query(sql, (sqlErr, sqlResult) => {
            if (sqlErr) throw sqlErr;
            else {
                httpRes.writeHead(200, { "Content-Type": "text/html" });
                if (sqlResult.length !== 0) {
                    bcrypt
                        .compare(password, sqlResult[0].hashedPassword)
                        .then(bcryptResult => {
                            if (bcryptResult) {
                                httpRes.write("Logged in.");
                                LOG(MODE.suc, `user ${sqlResult[0].username} logged in`);
                            } else {
                                httpRes.write("Username or password incorrect.");
                                LOG(MODE.war, `username: ${username} login failed`);
                            }
                            httpRes.end();
                        })
                        .catch(bcryptErr => console.error(bcryptErr.message));
                } else {
                    httpRes.write("Username or password incorrect.");
                    LOG(MODE.war, `username: ${username} login failed`);
                    httpRes.end();
                }
            }
        });
    }
};

module.exports = functionalRoute;

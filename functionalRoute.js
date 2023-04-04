"use strict";

const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const { LOG, MODE } = require("./logger.js");

const database = "messenger";
const userTable = `${database}.user`;
require("dotenv").config();

const saltRounds = 10;

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

const functionalRoute = {
    "/": function (httpQuery, httpRes) {
        httpRes.writeHead(301, { Location: "./login/" });
        httpRes.end();
    },
    "/signup/api": function (httpQuery, httpRes) {
        const username = sqlEscape(httpQuery.body.username);
        const password = httpQuery.body.password;
        bcrypt
            .genSalt(saltRounds)
            .then(salt => bcrypt.hash(password, salt))
            .then(hashedPassword => {
                const sql = `INSERT INTO ${userTable} (username, hashedPassword) VALUES ('${username}', '${hashedPassword}')`;
                sqlConnection.query(sql, (sqlErr, sqlResult) => {
                    if (!sqlErr) {
                        httpRes.writeHead(200, { "Content-Type": "text/html" });
                        httpRes.write("success");
                        httpRes.end();
                        LOG(MODE.suc, `user '${username}' created`);
                    } else if (sqlErr.code === "ER_DUP_ENTRY") {
                        httpRes.writeHead(200, { "Content-Type": "text/html" });
                        httpRes.write("username already exist");
                        httpRes.end();
                        LOG(MODE.war, `create error user '${username}' already exist`);
                    } else {
                        throw sqlErr;
                    }
                });
            })
            .catch(bCryptErr => {
                throw bCryptErr;
            });
    },
    "/login/api": function (httpQuery, httpRes) {
        const username = sqlEscape(httpQuery.body.username);
        const password = httpQuery.body.password;
        const sql = `SELECT username FROM ${userTable} WHERE username='${username}'`;
        sqlConnection.query(sql, (sqlErr, sqlResult) => {
            if (!sqlErr) {
                if (sqlResult.length !== 0) {
                    bcrypt
                        .compare(password, sqlResult[0].hashedPassword)
                        .then(bcryptResult => {
                            if (bcryptResult) {
                                httpRes.setHeader("Set-Cookie", `userId=${sqlResult[0].userId}`);
                                httpRes.writeHead(200, { "Content-Type": "text/html" });
                                httpRes.write("Logged in.");
                                httpRes.end();
                                LOG(MODE.suc, `user '${sqlResult[0].username}' logged in`);
                            } else {
                                httpRes.writeHead(200, { "Content-Type": "text/html" });
                                httpRes.write("Username or password incorrect.");
                                httpRes.end();
                                LOG(MODE.war, `user '${sqlResult[0].username}' login failed`);
                            }
                        })
                        .catch(bcryptErr => console.error(bcryptErr.message));
                } else {
                    httpRes.writeHead(200, { "Content-Type": "text/plain" });
                    httpRes.write("Username or password incorrect.");
                    LOG(MODE.war, `user '${httpQuery.body.username}' login failed`);
                    httpRes.end();
                }
            } else {
                throw sqlErr;
            }
        });
    }
};

function sqlEscape(string) {
    return string.replace(/[']/g, "''");
}

module.exports = functionalRoute;

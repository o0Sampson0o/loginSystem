"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");

const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { route } = require("../utils/routeUtils.js");

const saltRounds = 10;
const database = "messenger";
const userTable = `${database}.user`;

function signup(httpQuery, httpRes) {
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
}

const urls = [
    route("api", signup)
];

urls.reverse();

module.exports = urls;
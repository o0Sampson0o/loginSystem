"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");

const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { route } = require("../utils/routeUtils.js");

const database = "messenger";
const userTable = `${database}.user`;

function login(httpQuery, httpRes) {
    const username = sqlEscape(httpQuery.body.username);
    const password = httpQuery.body.password;
    const sql = `SELECT username, hashedPassword FROM ${userTable} WHERE username='${username}'`;
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

const urls = [
    route("api", login)
];

urls.reverse();

module.exports = urls;
"use strict";

const bcrypt = require("bcrypt");
const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");

const database = "messenger";
const userTable = `${database}.user`;
require("dotenv").config();

function parseUrl(string) {
    return string.match(/[^\/]+\/?|\//g);
}

function route(url, next) {
    const parsedUrl = parseUrl(url).map(x => {
        if (x[0] !== "<" || x[x.length - 2] !== ">") {
            return {
                dynamic: false,
                word: x
            };
        } else {
            const [type, name] = token.substr(1, token.length - 3).split(" ");
            return {
                dynamic: true,
                type,
                name,
                slash: x[length - 1] === "/"
            };
        }
    });
    return {token: parsedUrl, chain: next};
}


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

function sqlEscape(string) {
    return string.replace(/[']/g, "''");
}

module.exports = urls;
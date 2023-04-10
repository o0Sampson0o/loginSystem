"use strict";

const { parseCookies, readRequestBody } = require("../utils/httpUtils");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { serve404Page, serveStaticFileFor } = require("../utils/fileUtils.js");
const { LOG, MODE } = require("../logger.js");
const sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");

const database = "messenger";
const userTable = `${database}.user`;

module.exports.login = function ({ httpReq, httpRes }) {
    readRequestBody(httpReq).then(body => {
        const username = sqlEscape(body.username);
        const password = body.password;
        const sql = `SELECT username, hashedPassword, userId FROM ${userTable} WHERE username='${username}'`;
        sqlConnection.query(sql, (sqlErr, sqlResult) => {
            if (!sqlErr) {
                if (sqlResult.length !== 0) {
                    bcrypt
                        .compare(password, sqlResult[0].hashedPassword)
                        .then(bcryptResult => {
                            if (bcryptResult) {
                                httpRes.setHeader("Set-Cookie", [
                                    `username=${sqlResult[0].username}; path=/;SameSite=None;Secure`,
                                    `userId=${sqlResult[0].userId}; path=/;SameSite=None;Secure`
                                ]);
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
                    LOG(MODE.war, `user '${body.username}' login failed`);
                    httpRes.end();
                }
            } else {
                throw sqlErr;
            }
        });
    });
};

module.exports.RedirectIfLoggedInOrServeHtml = function ({ httpReq, httpRes }) {
    const cookies = parseCookies(httpReq);
    if (cookies.userId && cookies.username) {
        httpRes.writeHead(307, { Location: "/messenger/" });
        httpRes.end();
        return;
    }
    fs.readFile(`./login/static/index.html`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/html" });
            httpRes.write(file);
            httpRes.end();
        } else {
            serve404Page(httpRes);
        }
    });
};

module.exports.serveStaticFile = serveStaticFileFor("login");
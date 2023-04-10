"use strict";

const { parseCookies, readRequestBody } = require('../utils/httpUtils');
const bcrypt = require("bcrypt");
const fs = require("fs");

const { LOG, MODE } = require("../logger.js");
const sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");

const database = "messenger";
const userTable = `${database}.user`;

module.exports.login = function({ httpReq, httpRes }) {
    readRequestBody(httpReq)
    .then(body => {
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
                                httpRes.setHeader("Set-Cookie", [`username=${sqlResult[0].username}; path=/;SameSite=None;Secure`, `userId=${sqlResult[0].userId}; path=/;SameSite=None;Secure`]);
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
    })
}

module.exports.RedirectIfLoggedInOrServeHtml = function({ httpReq, httpRes }) {
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
            fs.readFile("./404.html", function (err404, html404) {
                if (!err404) {
                    httpRes.writeHead(404, { "Content-Type": "text/html" });
                    httpRes.write(html404);
                    httpRes.end();
                } else {
                    throw err404;
                }
            });
        }
    });
}

module.exports.serveStaticFile = function({ httpRes, subFolderName, fileName }) {
    const fileType = fileName.split(".")[1];
    let contentType = "";
    if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
    else if (fileType === "htm") contentType = "text/html";
    else if (fileType === "css") contentType = "text/css";
    else if (fileType === "js") contentType = "application/javascript";

    fs.readFile(`./login/static/${subFolderName ? `${subFolderName}/` : ""}${fileName}`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": contentType });
            httpRes.write(file);
            httpRes.end();
        } else {
            fs.readFile("./404.html", function (err404, html404) {
                if (!err404) {
                    httpRes.writeHead(404, { "Content-Type": "text/html" });
                    httpRes.write(html404);
                    httpRes.end();
                } else {
                    throw err404;
                }
            });
        }
    });
}

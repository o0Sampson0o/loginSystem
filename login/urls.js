"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");
const fs = require("fs");

const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { route } = require("../utils/routeUtils.js");

const database = "messenger";
const userTable = `${database}.user`;

function login({httpQuery, httpRes}) {
    const username = sqlEscape(httpQuery.body.username);
    const password = httpQuery.body.password;
    const sql = `SELECT username, hashedPassword, userId FROM ${userTable} WHERE username='${username}'`;
    sqlConnection.query(sql, (sqlErr, sqlResult) => {
        if (!sqlErr) {
            if (sqlResult.length !== 0) {
                bcrypt
                    .compare(password, sqlResult[0].hashedPassword)
                    .then(bcryptResult => {
                        if (bcryptResult) {
                            httpRes.setHeader("Set-Cookie", `userId=${sqlResult[0].userId};path=/`);
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

function RedirectIfLoggedInOrServeHtml({httpQuery, httpRes}) {
    if (httpQuery.cookies.userId) {
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

function serveStaticFile({httpQuery, httpRes, subFolderName, fileName}) {
    
    const fileType = fileName.split(".")[1];
    let contentType = "";
    if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
    else if (fileType === "htm") contentType = "text/html";
    else if (fileType === "css") contentType = "text/css";
    else if (fileType === "js") contentType = "application/javascript";

    fs.readFile(`./login/static/${subFolderName?`${subFolderName}/`:''}${fileName}`, function (err, file) {
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

const urls = [
    route("/", RedirectIfLoggedInOrServeHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile),
    route("api", login),
];

urls.reverse();

module.exports = urls;
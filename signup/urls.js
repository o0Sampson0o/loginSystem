"use strict";

require("dotenv").config();

const bcrypt = require("bcrypt");
const fs = require("fs");

const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { route } = require("../utils/routeUtils.js");

const saltRounds = 10;
const database = "messenger";
const userTable = `${database}.user`;

function signup({httpQuery, httpRes}) {
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

function serveHtml({httpQuery, httpRes}) {
    fs.readFile(`./signup/index.html`, function (err, file) {
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

function serveJs({httpQuery, httpRes}) {
    fs.readFile(`./signup/script.js`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "application/javascript" });
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

function serveCss({httpQuery, httpRes}) {
    fs.readFile(`./signup/style.css`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/css" });
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

function serveBackground({httpQuery, httpRes}) {
    fs.readFile(`./signup/images/background.jpg`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/css" });
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

// TODO: create a folder named static for all static file

const urls = [
    route("/", serveHtml),
    route("index.html", serveHtml),
    route("script.js", serveJs),
    route("style.css", serveCss),
    route("images/background.jpg", serveBackground),
    route("api", signup),
];

urls.reverse();

module.exports = urls;
"use strict";

const bcrypt = require("bcrypt");
const fs = require("fs");

const { LOG, MODE } = require("../logger.js");
const sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { parseCookies, readRequestBody } = require("../utils/httpUtils");

const saltRounds = 10;
const database = "messenger";
const userTable = `${database}.user`;

module.exports.signup = function({ httpQuery, httpReq, httpRes }) {
    readRequestBody(httpReq).then(body => {
        const username = sqlEscape(body.username);
        const password = body.password;
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
    });
}

module.exports.serveHtml = function({ httpQuery, httpRes }) {
    fs.readFile(`./signup/static/index.html`, function (err, file) {
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

module.exports.serveStaticFile = function({ httpQuery, httpRes, subFolderName, fileName }) {
    const fileType = fileName.split(".")[1];
    let contentType = "";
    if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
    else if (fileType === "htm") contentType = "text/html";
    else if (fileType === "css") contentType = "text/css";
    else if (fileType === "js") contentType = "application/javascript";

    fs.readFile(`./signup/static/${subFolderName ? `${subFolderName}/` : ""}${fileName}`, function (err, file) {
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
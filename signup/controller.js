"use strict";

const bcrypt = require("bcrypt");
const fs = require("fs");
const { serve404Page, serveStaticFileFor }  = require('../utils/fileUtils.js')

const { LOG, MODE } = require("../logger.js");
const sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { readRequestBody } = require("../utils/httpUtils");

const saltRounds = 10;
const database = "messenger";
const userTable = `${database}.user`;

module.exports.signup = function({ httpReq, httpRes }) {
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

module.exports.serveHtml = function({ httpRes }) {
    fs.readFile(`./signup/static/index.html`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/html" });
            httpRes.write(file);
            httpRes.end();
        } else {
            serve404Page(httpRes);
        }
    });
}

module.exports.serveStaticFile = serveStaticFileFor("signup");
"use strict";

const bcrypt = require("bcrypt");
const fs = require("fs");
const { serve404Page, serveStaticFileFor } = require("../utils/fileUtils.js");

const { LOG, MODE } = require("../logger.js");
const sqlConnection = require("../sqlConnection.js");
const { sqlEscape } = require("../utils/sqlUtils.js");
const { readRequestBody } = require("../utils/httpUtils");

const saltRounds = 10;
const database = "messenger";
const userTable = `${database}.user`;
const userProfileTable = `${database}.userProfile`;
module.exports.signup = function ({ httpReq, httpRes }) {
    readRequestBody(httpReq).then(body => {
        const username = sqlEscape(body.username);
        const password = body.password;
        bcrypt
            .genSalt(saltRounds)
            .then(salt => bcrypt.hash(password, salt))
            .then(async function (hashedPassword) {
                let userId;
                let userProfileId;
                await sqlConnection
                    .promise()
                    .query(`INSERT INTO ${userTable} (username, hashedPassword) VALUES ('${username}', '${hashedPassword}')`)
                    .then(sqlResult => {
                        httpRes.writeHead(200, { "Content-Type": "text/html" });
                        httpRes.write("success");
                        httpRes.end();
                        LOG(MODE.suc, `user '${username}' created`);
                        userId = sqlResult[0].insertId;
                    })
                    .catch((err) => {
                        if (err.code === "ER_DUP_ENTRY") {
                            httpRes.writeHead(200, { "Content-Type": "text/html" });
                            httpRes.write("username already exist");
                            httpRes.end();
                            LOG(MODE.war, `create error user '${username}' already exist`);
                        } else {
                            throw sqlErr;
                        }
                    });
                    if (!userId) return;
                await sqlConnection
                    .promise()
                    .query(`INSERT INTO ${userProfileTable} (userProfileId, displayName) VALUES (${userId}, '${username}')`);
                sqlConnection.promise().query(`UPDATE ${userTable} SET userProfileId = ${userId} WHERE userId = ${userId};`);
            })
            .catch(bCryptErr => {
                throw bCryptErr;
            });
    });
};

module.exports.serveHtml = function ({ httpRes }) {
    fs.readFile(`./signup/static/index.html`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/html" });
            httpRes.write(file);
            httpRes.end();
        } else {
            serve404Page(httpRes);
        }
    });
};

module.exports.serveStaticFile = serveStaticFileFor("signup");

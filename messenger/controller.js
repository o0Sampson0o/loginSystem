"use strict";

const fs = require("fs");
const { parseCookies } = require("../utils/httpUtils.js");
const sqlConnection = require("../sqlConnection.js");
const { serve404Page, serveStaticFileFor } = require("../utils/fileUtils.js");
const database = "messenger";
const userTable = `${database}.user`;
const userProfileTable = `${database}.userProfile`;
module.exports.ServeHtml = function ({ httpReq, httpRes }) {
    const cookies = parseCookies(httpReq);
    if (!cookies.userId || !cookies.username) {
        httpRes.writeHead(307, { Location: "/" });
        httpRes.end();
        return;
    }
    fs.readFile(`./messenger/static/index.html`, function (err, file) {
        if (!err) {
            httpRes.writeHead(200, { "Content-Type": "text/html" });
            httpRes.write(file);
            httpRes.end();
        } else {
            serve404Page(httpRes);
        }
    });
};

module.exports.findFriend = function ({ httpReq, httpRes, name }) {
    sqlConnection.query(`SELECT displayName, userProfileId FROM ${userProfileTable} WHERE displayName LIKE '%${name}%'`, (sqlErr, sqlResult) => {
        httpRes.writeHead(200, { "Content-Type": "application/json" });
        httpRes.write(JSON.stringify(sqlResult));
        httpRes.end();
    });
};

module.exports.serveStaticFile = serveStaticFileFor("messenger");
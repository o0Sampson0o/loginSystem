"use strict";

const fs = require("fs");
const { parseCookies } = require("../utils/httpUtils.js");
const { serve404Page, serveStaticFileFor } = require("../utils/fileUtils.js");

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

module.exports.serveStaticFile = serveStaticFileFor("messenger");
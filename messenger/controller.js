"use strict";

const fs = require("fs");
const { parseCookies, readRequestBody } = require('../utils/httpUtils');

module.exports.ServeHtml = function({ httpQuery, httpReq, httpRes }) {
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

    fs.readFile(`./messenger/static/${subFolderName ? `${subFolderName}/` : ""}${fileName}`, function (err, file) {
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
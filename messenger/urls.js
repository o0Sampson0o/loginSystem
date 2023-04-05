"use strict";

const fs = require("fs");


const { route } = require("../utils/routeUtils.js");

function ServeHtml({httpQuery, httpRes}) {
    if (!httpQuery.cookies.userId) {
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

function serveStaticFile({httpQuery, httpRes, subFolderName, fileName}) {
    console.log(`./messenger/static/${subFolderName?`${subFolderName}/`:''}${fileName}`);
    const fileType = fileName.split(".")[1];
    let contentType = "";
    if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
    else if (fileType === "htm") contentType = "text/html";
    else if (fileType === "css") contentType = "text/css";
    else if (fileType === "js") contentType = "application/javascript";

    fs.readFile(`./messenger/static/${subFolderName?`${subFolderName}/`:''}${fileName}`, function (err, file) {
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
    route("/", ServeHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile),
];

urls.reverse();

module.exports = urls;
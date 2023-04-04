"use strict";

const http = require("http");
const url = require("url");
const fs = require("fs");
const util = require('util');
const pathUrls = require("./urls");

const functionalRoute = require("./functionalRoute");


http.createServer(function (httpRequest, httpRespond) {
    const urlObj = url.parse(httpRequest.url, true);
    const queryFromUrl = urlObj.query;

    const parsedUrl = parseUrl(urlObj.pathname);
    if (parsedUrl.length > 1) {
        parsedUrl.shift();
    }
    const cookies = parseCookies(httpRequest);

    httpRespond.setHeader("Access-Control-Allow-Origin", "*");
    httpRespond.setHeader("Access-Control-Request-Method", "*");
    httpRespond.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
    httpRespond.setHeader("Access-Control-Allow-Headers", "*");

    if (httpRequest.method === "OPTIONS") {
        httpRespond.writeHead(200);
        httpRespond.end();
        return;
    }

    (async function () {
        const buffers = [];
        for await (const chunk of httpRequest) {
            buffers.push(chunk);
        }
        const rawData = Buffer.concat(buffers).toString();
        return rawData === "" ? {} : JSON.parse(rawData);
    })().then(queryFromBody => {
        const query = { url: queryFromUrl, body: queryFromBody, cookies };

        let found = execute(parsedUrl, { query, httpRespond });

        if (found) {
            console.log(found);
            return;
        }
        if (functionalRoute[urlObj.pathname]) {
            functionalRoute[urlObj.pathname](query, httpRespond);
        } else {
            const fileType = urlObj.pathname.split(".")[1];
            let contentType = "";
            if (fileType === undefined) urlObj.pathname += "index.html";
            if (fileType === "ico") {
                httpRespond.end();
                return;
            } else if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
            else if (fileType === "htm") contentType = "text/html";
            else if (fileType === "css") contentType = "text/css";
            else if (fileType === "js") contentType = "application/javascript";
            fs.readFile(`.${urlObj.pathname}`, function (err, file) {
                if (!err) {
                    httpRespond.writeHead(200, { "Content-Type": contentType });
                    httpRespond.write(file);
                    httpRespond.end();
                } else {
                    fs.readFile("./404.html", function (err404, html404) {
                        if (!err404) {
                            httpRespond.writeHead(404, { "Content-Type": "text/html" });
                            httpRespond.write(html404);
                            httpRespond.end();
                        } else {
                            throw err404;
                        }
                    });
                }
            });
        }
    });
}).listen(8080);

function parseCookies(request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

async function readRequestBody(httpRequest) {
    const buffers = [];
    for await (const chunk of httpRequest) {
        buffers.push(chunk);
    }
    const rawData = Buffer.concat(buffers).toString();
    return rawData === "" ? {} : JSON.parse(rawData);
}

// messenger/<int id>/index.html
function execute(url, data) {
    const stack = [...pathUrls.map(x => ({...x, currentUrl: [...url]}))];
    let found = false;
    while (stack.length !== 0) {
        const { token, chain, currentUrl } = stack.pop();
        
        let match = true;

        for (let i = 0; i < token.length; i++) {
            if (!token.dynamic) {
                if (token[i].word !== currentUrl[i]) {
                    match = false;
                    break;
                }
            }
        }

        if (match) {
            currentUrl.splice(0, token.length);
            if (typeof chain !== "function") {
                stack.push(...chain.map(x => ({...x, currentUrl})));
            } else {
                found = true;
                chain(...Object.values(data));
                console.log(util.inspect(chain, true, null, true));
                break;
            }
        }
    }
    return found;

}

function parseUrl(string) {
    return string.match(/[^\/]+\/?|\//g);
}
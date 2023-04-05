"use strict";

const http = require("http");
const url = require("url");
const fs = require("fs");
const pathUrls = require("./urls");
const { parseUrl } = require("./utils/routeUtils");

http.createServer(function (httpRequest, httpRespond) {
    const urlObj = url.parse(httpRequest.url, true);
    const queryFromUrl = urlObj.query;

    const parsedUrl = parseUrl(urlObj.pathname);
    if (parsedUrl.length > 1) {
        parsedUrl.shift();
    }

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
        const cookies = parseCookies(httpRequest);
        const query = { url: queryFromUrl, body: queryFromBody, cookies };
        let found = execute(parsedUrl, { httpQuery: query, httpRes: httpRespond });

        if (found) {
            return;
        }

        fs.readFile("./404.html", function (err404, html404) {
            if (!err404) {
                httpRespond.writeHead(404, { "Content-Type": "text/html" });
                httpRespond.write(html404);
                httpRespond.end();
            } else {
                throw err404;
            }
        });
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
    const stack = [...pathUrls.map(x => ({ ...x, currentUrl: [...url], currentVars: {} }))];
    let found = false;
    while (stack.length !== 0) {
        const { token, chain, currentUrl, currentVars } = stack.pop();
        
        let match = true;
        
        const currentVars_ = {...currentVars};
        if (currentUrl.length < token.length) continue;
        for (let i = 0; i < token.length; i++) {
            if (!token[i].dynamic) {
                if (token[i].word !== currentUrl[i]) {
                    match = false;
                    break;
                }
            }
            else {
                const cleanedUpWord = token[i].slash ? currentUrl[i].slice(0, -1) : currentUrl[i];
                if (token[i].type === "int" && !isNaN(cleanedUpWord)) {
                    currentVars_[token[i].name] = +cleanedUpWord;
                } else if (token[i].type === "str") {
                    currentVars_[token[i].name] = cleanedUpWord;
                } else {
                    match = false;
                    break;
                }
            }
        }
        
        if (match) {
            if (typeof chain !== "function") {
                stack.push(...chain.map(x => ({ ...x, currentUrl: currentUrl.slice(token.length).length === 0 ? ["/"] : currentUrl.slice(token.length), currentVars: currentVars_ })));
            } else {
                found = true;
                chain({...data, ...currentVars_});
                break;
            }
        }
    }
    return found;
}
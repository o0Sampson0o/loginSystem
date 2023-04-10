"use strict";

const http = require("http");
const urlUtils = require("url");
const fs = require("fs");
const pathUrls = require("./urls");
const { parseUrl } = require("./utils/routeUtils");
const { v4: uuidv4 } = require('uuid');


const httpServer = http.createServer(requestHandler).listen(8080);

function requestHandler(httpReq, httpRes) {
    const url = urlUtils.parse(httpReq.url, true);
    const httpQuery = url.query;
    
    const parsedUrl = parseUrl(url.pathname);
    if (parsedUrl.length > 1) parsedUrl.shift();
    
    if (httpReq.method === "OPTIONS") {
        httpRes.setHeader("Access-Control-Allow-Origin", "*");
        httpRes.setHeader("Access-Control-Request-Method", "*");
        httpRes.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
        httpRes.setHeader("Access-Control-Allow-Headers", "*");
        httpRes.writeHead(200);
        httpRes.end();
        return;
    }

    let found = execute(parsedUrl, { httpQuery, httpReq, httpRes });

    if (found) {
        return;
    }
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
                if (currentUrl.length === token.length) {
                    found = true;
                    chain({...data, ...currentVars_});
                    break;
                }
            }
        }
    }
    return found;
}

// * ----------------------------------    WEB SOCKET SERVER   ----------------------------------------

const WebSocketServer = require('websocket').server;

const wsServer = new WebSocketServer({
        httpServer: httpServer,
        autoAcceptConnections: false
    });

const clients = {}; 
let clientsCount = 0;
wsServer.on("request", request => {
    const parsedUrl = parseUrl(request.resourceURL.pathname);
    if (parsedUrl.length > 1) {
        parsedUrl.shift();
    }
    
    if (parsedUrl[0] !== "ws/" && parsedUrl[0] !== "ws") {
        request.reject();
        return;
    }
    
    const connection = request.accept('echo-protocol', request.origin);

    const cookies = {};
    request.cookies.forEach(x => cookies[x.name] = x.value);
    const { username, userId } = cookies;
    const uuid = uuidv4();
    clientsCount++;
    clients[uuid] = {username, userId, connection};
    connection.send(JSON.stringify({uuid}));
    connection.on('message', data => {
        if (data.type === 'utf8') {
            if (data.utf8Data === "ping") {
                return;
            }
            const message = JSON.parse(data.utf8Data);
            for (const clientSessionId in clients) {
                clients[clientSessionId].connection.sendUTF(JSON.stringify({sender: clients[message.sessionId].username, message: message.message }));
            }
        }
        else if (data.type === 'binary') {
            console.log('Received Binary Message of ' + data.binaryData.length + ' bytes');
            //connection.sendBytes(data.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        clientsCount--;
    });

});
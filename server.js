"use strict";

const http = require("http");
const urlUtils = require("url");
const pathUrls = require("./urls");
const { parseUrl, executeFrom } = require("./utils/routeUtils");
const { serve404Page } = require("./utils/fileUtils");
const PORT = 8080;

const execute = executeFrom(pathUrls);

// * --------------------------------------------------          HTTP SERVER         --------------------------------------------------

const httpServer = http.createServer(requestHandler).listen(PORT);

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

    const success = execute(parsedUrl, { httpQuery, httpReq, httpRes });

    if (success) return;

    serve404Page(httpRes);
}

// * --------------------------------------------------        END HTTP SERVER       --------------------------------------------------
// * ----------------------------------------------------------------------------------------------------------------------------------
// * --------------------------------------------------       WEB SOCKET SERVER      --------------------------------------------------

const WebSocketServer = require("websocket").server;
const { v4: uuidv4 } = require("uuid");

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

    const connection = request.accept("echo-protocol", request.origin);

    const cookies = {};
    request.cookies.forEach(x => (cookies[x.name] = x.value));
    const { username, userId } = cookies;
    const uuid = uuidv4();
    clientsCount++;
    clients[uuid] = { username, userId, connection };
    connection.send(JSON.stringify({ uuid }));
    connection.on("message", data => {
        if (data.type === "utf8") {
            if (data.utf8Data === "ping") {
                return;
            }
            const message = JSON.parse(data.utf8Data);
            for (const clientSessionId in clients) {
                clients[clientSessionId].connection.sendUTF(
                    JSON.stringify({ sender: clients[message.sessionId].username, message: message.message })
                );
            }
        } else if (data.type === "binary") {
            console.log("Received Binary Message of " + data.binaryData.length + " bytes");
            //connection.sendBytes(data.binaryData);
        }
    });

    connection.on("close", function (reasonCode, description) {
        clientsCount--;
    });
});

// * --------------------------------------------------     END WEB SOCKET SERVER    --------------------------------------------------
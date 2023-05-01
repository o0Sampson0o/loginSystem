"use strict";

require("./sqlConnection").connect();
require("./mongoConnection").connect();
const httpUtils = require("http");
const urlUtils = require("url");
const routeHeadNode = require("./urls");
const { parseToRoute, navigateFrom } = require("./utils/routeUtils");
const { serve404Page } = require("./utils/fileUtils");
const PORT = 8080;
const navigate = navigateFrom(routeHeadNode);

// * --------------------------------------------------          HTTP SERVER         --------------------------------------------------

const httpServer = httpUtils.createServer(requestHandler).listen(PORT);

function requestHandler(httpReq, httpRes) {
    // TODO: THINK ABOUT CORS;
    if (httpReq.method === "OPTIONS") {
        httpRes.setHeader("Access-Control-Allow-Origin", "*");
        httpRes.setHeader("Access-Control-Request-Method", "*");
        httpRes.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
        httpRes.setHeader("Access-Control-Allow-Headers", "*");
        httpRes.writeHead(200);
        httpRes.end();
        return;
    }

    const httpReqUrl = urlUtils.parse(httpReq.url, true);
    const httpQuery = httpReqUrl.query;

    const route = parseToRoute(httpReqUrl.pathname);
    if (route.length > 1) route.shift();

    const isExecuteSuccess = navigate(route, { httpQuery, httpReq, httpRes });

    if (!isExecuteSuccess) {
        serve404Page(httpRes);
    }
}

// * --------------------------------------------------        END HTTP SERVER       --------------------------------------------------
// * ----------------------------------------------------------------------------------------------------------------------------------
// * --------------------------------------------------       WEB SOCKET SERVER      --------------------------------------------------

const WebSocketServer = require("websocket").server;
const { v4: uuidv4 } = require("uuid");
const dateUtils = require("date-and-time");

const wsServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

const clients = {};
const userIdToUUIDMapper = {};
let clientsCount = 0;
wsServer.on("request", request => {
    const route = parseToRoute(request.resourceURL.pathname);
    if (route.length > 1) {
        route.shift();
    }

    if (route[0] !== "ws/" && route[0] !== "ws") {
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
    userIdToUUIDMapper[+userId] = (userIdToUUIDMapper[+userId] || []).concat(uuid);
    connection.send(JSON.stringify({ uuid }));
    connection.on("message", data => {
        if (data.type === "utf8") {
            if (data.utf8Data === "ping") {
                return;
            }
            const message = JSON.parse(data.utf8Data);

            if (message.isGlobal) {
                for (const clientSessionId in clients) {
                    clients[clientSessionId].connection.sendUTF(
                        JSON.stringify({
                            sender: clients[message.sessionId].username,
                            senderId: clients[message.sessionId].userId,
                            message: message.message,
                            isGlobal: true
                        })
                    );
                }
            } else {
                const senderId = clients[message.sessionId].userId;
                const mongoDbConnection = require("./mongoConnection").getConnection();
                mongoDbConnection
                    .collection("Messages")
                    .findOne({ between: [+senderId, +message.to].sort() })
                    .then(x => {
                        const currentTime = new Date();
                        if (x === null) {
                            const messageItem = {
                                between: [+senderId, +message.to],
                                [dateUtils.format(currentTime, "DD-MM-YYYY HH")]: [
                                    {
                                        sender: +senderId,
                                        time: `${dateUtils.format(currentTime, "mm:ss:SSS")}`,
                                        message: message.message
                                    }
                                ]
                            };
                            mongoDbConnection.collection("Messages").insertOne(messageItem);
                        } else {
                            const o_id = x._id;

                            const chunk = x[`${dateUtils.format(currentTime, "DD-MM-YYYY HH")}`];
                            if (chunk) {
                                mongoDbConnection.collection("Messages").updateOne(
                                    { _id: o_id },
                                    {
                                        $push: {
                                            [dateUtils.format(currentTime, "DD-MM-YYYY HH")]: {
                                                sender: +senderId,
                                                time: `${dateUtils.format(currentTime, "mm:ss:SSS")}`,
                                                message: message.message
                                            }
                                        }
                                    }
                                );
                            } else {
                                mongoDbConnection.collection("Messages").updateOne(
                                    { _id: o_id },
                                    {
                                        $set: {
                                            [dateUtils.format(currentTime, "DD-MM-YYYY HH")]: {
                                                sender: +senderId,
                                                time: `${dateUtils.format(currentTime, "mm:ss:SSS")}`,
                                                message: message.message
                                            }
                                        }
                                    }
                                );
                            }
                        }
                    });

                userIdToUUIDMapper[+message.to]?.forEach(uuid => {
                    clients[uuid].connection.sendUTF(
                        JSON.stringify({
                            sender: clients[message.sessionId].username,
                            senderId: clients[message.sessionId].userId,
                            message: message.message,
                            isGlobal: false
                        })
                    );
                });
                if (+message.to === +senderId) {
                    return;
                }
                userIdToUUIDMapper[+senderId]?.forEach(uuid => {
                    clients[uuid].connection.sendUTF(
                        JSON.stringify({
                            sender: clients[message.sessionId].username,
                            senderId: clients[message.sessionId].userId,
                            message: message.message,
                            isGlobal: false
                        })
                    );
                });
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

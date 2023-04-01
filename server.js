"use strict";

const http = require("http");
const url = require("url");
const route = require("./route");

http.createServer(function (httpRequest, httpRespond) {
    const urlObj = url.parse(httpRequest.url);
    const queryDestruct = urlObj.query?.split(/[&=]/);
    let queryObj = {};

    if (queryDestruct?.length) {
        for (let i = 0; i < queryDestruct.length; i += 2) {
            queryObj[queryDestruct[i]] = queryDestruct[i + 1];
        }
    }

    (async function () {
        const buffers = [];
        for await (const chunk of httpRequest) {
            buffers.push(chunk);
        }
        const rawData = Buffer.concat(buffers).toString();
        return rawData === "" ? {} : JSON.parse(rawData);
    })().then((data) => {
        queryObj.data = data;
        if (route[urlObj.pathname]) {
            route[urlObj.pathname](queryObj, httpRespond)
        } else {
            console.log(urlObj.pathname);
        }
    });
}).listen(8080);

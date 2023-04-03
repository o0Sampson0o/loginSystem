"use strict";

const http = require("http");
const url = require("url");
const fs = require("fs");

const ngrok = require("ngrok");
(async function () {
    const url = await ngrok.connect();
})();

const functionalRoute = require("./functionalRoute");

http.createServer(function (httpRequest, httpRespond) {
    console.log(httpRequest.url);
    const urlObj = url.parse(httpRequest.url);
    const queryDestruct = urlObj.query?.split(/[&=]/);
    let queryObj = {};

    httpRespond.setHeader('Access-Control-Allow-Origin', '*');
	httpRespond.setHeader('Access-Control-Request-Method', '*');
	httpRespond.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
	httpRespond.setHeader('Access-Control-Allow-Headers', '*');
	if ( httpRequest.method === 'OPTIONS' ) {
		httpRespond.writeHead(200);
		httpRespond.end();
		return;
	}
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
    })().then(data => {
        queryObj.data = data;
        if (functionalRoute[urlObj.pathname]) {
            functionalRoute[urlObj.pathname](queryObj, httpRespond);
        } else {
            const fileType = urlObj.pathname.split(".")[1];
            let contentType = "";
            if (fileType === undefined) {
                urlObj.pathname += "index.html";
            }
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

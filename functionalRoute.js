"use strict";

const functionalRoute = {
    "/": function (httpQuery, httpRes) {
        httpRes.writeHead(301, { Location: "./login/" });
        httpRes.end();
    }
};

module.exports = functionalRoute;

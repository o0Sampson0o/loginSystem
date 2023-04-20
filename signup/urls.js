"use strict";

const { routeNode } = require("../utils/routeUtils.js");
const { serveHtml, serveStaticFile, signup } = require("./controller.js");

const urls = [
    routeNode("/", serveHtml),
    routeNode("static/<str fileName>", serveStaticFile),
    routeNode("static/<str subFolderName>/<str fileName>", serveStaticFile),
    routeNode("api", signup)
];

urls.reverse();

module.exports = urls;
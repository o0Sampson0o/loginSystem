"use strict";

const { ServeHtml, serveStaticFile, findFriend } = require("./controller.js");
const { routeNode } = require("../utils/routeUtils.js");

const urls = [
    routeNode("/", ServeHtml),
    routeNode("static/<str fileName>", serveStaticFile),
    routeNode("static/<str subFolderName>/<str fileName>", serveStaticFile),
    routeNode("getFriend/<str name>", findFriend)
];

urls.reverse();

module.exports = urls;

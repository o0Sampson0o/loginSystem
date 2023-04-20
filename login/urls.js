"use strict";

const { routeNode } = require("../utils/routeUtils.js");
const { RedirectIfLoggedInOrServeHtml, serveStaticFile, login } = require("./controller.js");
const urls = [
    routeNode("/", RedirectIfLoggedInOrServeHtml),
    routeNode("static/<str fileName>", serveStaticFile),
    routeNode("static/<str subFolderName>/<str fileName>", serveStaticFile),
    routeNode("api", login)
];

urls.reverse();

module.exports = urls;

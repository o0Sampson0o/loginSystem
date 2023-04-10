"use strict";

const { ServeHtml, serveStaticFile } = require("./controller.js");
const { route } = require("../utils/routeUtils.js");

const urls = [
    route("/", ServeHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile)
];

urls.reverse();

module.exports = urls;

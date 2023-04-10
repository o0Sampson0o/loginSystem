"use strict";

const { route } = require("../utils/routeUtils.js");
const { serveHtml, serveStaticFile, signup } = require("./controller.js");

const urls = [
    route("/", serveHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile),
    route("api", signup)
];

urls.reverse();

module.exports = urls;

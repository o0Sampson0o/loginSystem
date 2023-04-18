"use strict";

const { ServeHtml, serveStaticFile, findFriend } = require("./controller.js");
const { route } = require("../utils/routeUtils.js");

const urls = [
    route("/", ServeHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile),
    route("getFriend/<str name>", findFriend)
];

urls.reverse();

module.exports = urls;

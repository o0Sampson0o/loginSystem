"use strict";

const { route } = require("../utils/routeUtils.js");
const { RedirectIfLoggedInOrServeHtml, serveStaticFile, login } = require("./controller.js");
const urls = [
    route("/", RedirectIfLoggedInOrServeHtml),
    route("static/<str fileName>", serveStaticFile),
    route("static/<str subFolderName>/<str fileName>", serveStaticFile),
    route("api", login)
];

urls.reverse();

module.exports = urls;

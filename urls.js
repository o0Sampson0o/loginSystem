"use strict";

const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");
const messengerPageUrls = require("./messenger/urls");
const { route } = require("./utils/routeUtils.js");

const urls = [
    ...loginPageUrls,
    route("signup/", signupPageUrls),
    route("login/", loginPageUrls),
    route("messenger/", messengerPageUrls)
];

urls.reverse();

module.exports = urls;
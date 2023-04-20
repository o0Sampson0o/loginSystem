"use strict";

const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");
const messengerPageUrls = require("./messenger/urls");
const { routeNode } = require("./utils/routeUtils.js");

const urls = [
    ...loginPageUrls,
    routeNode("signup/", signupPageUrls),
    routeNode("login/", loginPageUrls),
    routeNode("messenger/", messengerPageUrls)
];

urls.reverse();

module.exports = urls;
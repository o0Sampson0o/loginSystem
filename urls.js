"use strict";

const util = require('util');

const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");
const messengerPageUrls = require("./messenger/urls");
const { route } = require("./utils/routeUtils.js");

// messenger/<int id>/index.html
const urls = [
    ...loginPageUrls,
    route("signup/", signupPageUrls), 
    route("login/", loginPageUrls),
    route("messenger/", messengerPageUrls)
];

urls.reverse();

//console.log(util.inspect(urls, false, null, true));

module.exports = urls;
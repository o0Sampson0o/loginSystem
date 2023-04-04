const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");
const { route } = require("./utils/routeUtils.js");

function redirectToLogin(httpQuery, httpRes) {
    httpRes.writeHead(301, { Location: "./login/" });
    httpRes.end();
}

// messenger/<int id>/index.html
urls = [route("login/", loginPageUrls), route("signup/", signupPageUrls), route("/", redirectToLogin)];

urls.reverse();

module.exports = urls;
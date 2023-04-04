const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");


function route(url, next) {
    if (typeof next === "function") {
    } else {

    }
}

urls = [
    route("/login/", loginPageUrls),
    route("/signup/", signupPageUrls)
]

module.exports = urls;
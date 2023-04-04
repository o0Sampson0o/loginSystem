const loginPageUrls = require("./login/urls");
const signupPageUrls = require("./signup/urls");

function parseUrl(string) {
    return string.match(/[^\/]+\/?|\//g);
}

function route(url, next) {
    const parsedUrl = parseUrl(url).map(x => {
        if (x[0] !== "<" || x[x.length - 2] !== ">") {
            return {
                dynamic: false,
                word: x
            };
        } else {
            const [type, name] = token.substr(1, token.length - 3).split(" ");
            return {
                dynamic: true,
                type,
                name,
                slash: x[length - 1] === "/"
            };
        }
    });
    return { token: parsedUrl, chain: next };
}

function redirectToLogin(httpQuery, httpRes) {
    httpRes.writeHead(301, { Location: "./login/" });
    httpRes.end();
}

// messenger/<int id>/index.html
urls = [route("login/", loginPageUrls), route("signup/", signupPageUrls)];

urls.reverse();

module.exports = urls;

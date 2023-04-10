"use strict";

module.exports.parseUrl = function(string) {
    return string.match(/[^\/]+\/?|\//g);
}

module.exports.route = function(url, next) {
    const parsedUrl = parseUrl(url).map(x => {
        const slashed = x[x.length - 1] === "/";
        if (x[0] === "<" && x[x.length - (slashed ? 2 : 1)] === ">" ) {
                const [type, name] = x.substr(1, x.length - (slashed ? 3 : 2)).split(" ");
                return {
                    dynamic: true,
                    type,
                    name,
                    slash: slashed
                };
        } else {
            return {
                dynamic: false,
                word: x
            };
        }
    });
    return {token: parsedUrl, chain: next};
}
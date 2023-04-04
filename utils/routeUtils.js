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
    return {token: parsedUrl, chain: next};
}

module.exports.route = route;
module.exports.parseUrl = parseUrl;
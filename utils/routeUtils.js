"use strict";

function parseToRoute(string) {
    return string.match(/[^\/]+\/?|\//g);
}

function routeNode(url, next) {
    const parsedUrl = parseToRoute(url).map(x => {
        const slashed = x[x.length - 1] === "/";
        if (x[0] === "<" && x[x.length - (slashed ? 2 : 1)] === ">") {
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
    return { token: parsedUrl, chain: next };
}

function navigateFrom(headNode) {
    return function (url, data) {
        const stack = [...headNode.map(x => ({ ...x, currentUrl: [...url], currentVars: {} }))];
        let found = false;

        while (stack.length !== 0) {
            const { token, chain, currentUrl, currentVars } = stack.pop();
            const currentVars_ = { ...currentVars };
            let match = true;

            if (currentUrl.length < token.length)  {
                continue;
            }

            for (let i = 0; i < token.length; i++) {
                if (!token[i].dynamic) {
                    if (token[i].word !== currentUrl[i]) {
                        match = false;
                        break;
                    }
                } else {
                    const cleanedUpWord = token[i].slash ? currentUrl[i].slice(0, -1) : currentUrl[i];
                    if (token[i].type === "int" && !isNaN(cleanedUpWord)) {
                        currentVars_[token[i].name] = +cleanedUpWord;
                    } else if (token[i].type === "str") {
                        currentVars_[token[i].name] = cleanedUpWord;
                    } else {
                        match = false;
                        break;
                    }
                }
            }

            if (match) {
                if (typeof chain !== "function") {
                    stack.push(
                        ...chain.map(x => ({
                            ...x,
                            currentUrl: currentUrl.slice(token.length).length === 0 ? ["/"] : currentUrl.slice(token.length),
                            currentVars: currentVars_
                        }))
                    );
                } else if (currentUrl.length === token.length) {
                    found = true;
                    chain({ ...data, ...currentVars_ });
                    break;
                }
            }
        }
        return found;
    };
}

module.exports.routeNode = routeNode;
module.exports.parseToRoute = parseToRoute;
module.exports.navigateFrom = navigateFrom;
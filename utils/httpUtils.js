"use strict";

module.exports.readRequestBody = async function (httpRequest) {
    const buffers = [];
    for await (const chunk of httpRequest) {
        buffers.push(chunk);
    }
    const rawData = Buffer.concat(buffers).toString();
    return rawData === "" ? {} : JSON.parse(rawData);
};

module.exports.parseCookies = function (request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
};
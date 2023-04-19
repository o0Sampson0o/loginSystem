const fs = require("fs");

const contentTypeMapper = {
    css: "text/css",
    htm: "text/html",
    html: "text/html",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/javascript",
    png: "image/png"
};

module.exports.serveStaticFileFor = function (pageName) {
    return function ({ httpRes, subFolderName, fileName }) {
        const fileType = fileName.split(".").at(-1);
        const contentType = contentTypeMapper[fileType] || "text/plain";
        fs.readFile(`./${pageName}/static/${subFolderName ? `${subFolderName}/` : ""}${fileName}`, function (err, file) {
            if (!err) {
                httpRes.writeHead(200, { "Content-Type": contentType });
                httpRes.write(file);
                httpRes.end();
            } else {
                fs.readFile("./404.html", function (err404, html404) {
                    if (!err404) {
                        httpRes.writeHead(404, { "Content-Type": "text/html" });
                        httpRes.write(html404);
                        httpRes.end();
                    } else {
                        throw err404;
                    }
                });
            }
        });
    };
};

module.exports.serve404Page = function (httpRes) {
    fs.readFile("./404.html", function (err404, html404) {
        if (!err404) {
            httpRes.writeHead(404, { "Content-Type": "text/html" });
            httpRes.write(html404);
            httpRes.end();
        } else {
            throw err404;
        }
    });
};

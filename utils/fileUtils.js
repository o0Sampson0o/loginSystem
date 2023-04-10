const fs = require("fs");

module.exports.serveStaticFileFor = function (pageName) {
    return function ({ httpRes, subFolderName, fileName }) {
        const fileType = fileName.split(".")[1];
        let contentType = "";
        if (fileType === "jpg" || fileType === "jpeg") contentType = "image/jpeg";
        else if (fileType === "htm") contentType = "text/html";
        else if (fileType === "css") contentType = "text/css";
        else if (fileType === "js") contentType = "application/javascript";

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
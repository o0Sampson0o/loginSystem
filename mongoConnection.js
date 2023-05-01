const { MongoClient } = require("mongodb");
const { LOG, MODE } = require("./logger.js");

let connection;

let options = {
};

module.exports = {
    connect: async function (callback) {
        MongoClient.connect("mongodb://127.0.0.1:27017/Messenger", options).then(client => {
            connection = client.db();
            if (typeof callback === "function") return callback();
        });
        LOG(MODE.suc, "mongodb Connected!");
    },
    getConnection: () => connection
};

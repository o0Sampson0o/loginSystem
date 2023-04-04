"use strict";

const bcrypt = require("bcrypt");
const { LOG, MODE } = require("../logger.js");
const  sqlConnection = require("../sqlConnection.js");


const saltRounds = 10;



const database = "messenger";
const userTable = `${database}.user`;
require("dotenv").config();

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


function signup(httpQuery, httpRes) {
    const username = sqlEscape(httpQuery.body.username);
    const password = httpQuery.body.password;
    bcrypt
        .genSalt(saltRounds)
        .then(salt => bcrypt.hash(password, salt))
        .then(hashedPassword => {
            const sql = `INSERT INTO ${userTable} (username, hashedPassword) VALUES ('${username}', '${hashedPassword}')`;
            sqlConnection.query(sql, (sqlErr, sqlResult) => {
                if (!sqlErr) {
                    httpRes.writeHead(200, { "Content-Type": "text/html" });
                    httpRes.write("success");
                    httpRes.end();
                    LOG(MODE.suc, `user '${username}' created`);
                } else if (sqlErr.code === "ER_DUP_ENTRY") {
                    httpRes.writeHead(200, { "Content-Type": "text/html" });
                    httpRes.write("username already exist");
                    httpRes.end();
                    LOG(MODE.war, `create error user '${username}' already exist`);
                } else {
                    throw sqlErr;
                }
            });
        })
        .catch(bCryptErr => {
            throw bCryptErr;
        });
}

const urls = [
    route("api", signup)
];

urls.reverse();

function sqlEscape(string) {
    return string.replace(/[']/g, "''");
}

module.exports = urls;
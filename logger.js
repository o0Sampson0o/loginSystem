var date = new Date();
const white = "\x1b[37m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const red ="\x1b[31m";
const reset = "\x1b[0m";
const MODE = {
    msg: "msg",
    suc: "suc",
    war: "war",
    err: "err"
}

function LOG(mode, string) {
    let dateString = date.toDateString().split(" ");
    dateString = dateString[3] + "/" + dateString[1] + "/" + dateString[2];
    if (mode === MODE.msg) {
        console.log(white);
    } else if (mode === MODE.suc) {
        console.log(green);
    } else if (mode === MODE.war) {
        console.log(yellow);
    } else if (mode === MODE.err) {
        console.log(red);
    }
    console.log(`${mode}: ${dateString}-${date.toTimeString().split(' ')[0]}: ${string}`, reset);
}

module.exports.LOG = LOG;
module.exports.MODE = MODE;
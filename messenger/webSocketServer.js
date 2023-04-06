const { WebSocketServer } = require("ws");
const sockserver = new WebSocketServer({ port: 443 });

//const clients = new Map(); 

sockserver.on("connection", ws => {
    ws.send("connection established");
    ws.on("close", () => console.log("Client has disconnected!"));
    ws.on("message", data => {
        if (data.toString() === "ping") return;
        const msg = JSON.parse(data);
        console.log(`${msg.username}: ${msg.message}`);
        sockserver.clients.forEach(client => {
            client.send(`${msg.username}: ${msg.message}`);
        });
    });
    ws.onerror = function () {
        console.log("websocket error");
    };
});
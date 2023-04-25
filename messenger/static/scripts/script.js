"use strict";

const notification = new Notify("./static/audio/notification.mp3");
const friendSearcher = new FriendSearcher();
let connectionSession = null;
let chattingId = 0;

const cookies = {};
document.cookie
    .split(";")
    .map(x => ({
        name: x.split("=")[0].trim(),
        value: x.split("=")[1].trim()
    }))
    .forEach(x => (cookies[x.name] = x.value));

const domain = "f18b-2001-d08-d3-66ab-a4c1-cf41-3f43-8a5f.ngrok-free.app";
const webSocket = new WebSocket(`wss://${domain}/ws/${cookies.userId}`, "echo-protocol");
//const webSocket = new WebSocket(`ws://localhost:8080/ws/${cookies.userId}`, "echo-protocol");

const globalChat = new MessageBox(true, webSocket);
const directChat = new MessageBox(false, webSocket);

function chatTo(id) {
    if (chattingId == id) return;
    chattingId = id;
    directChat.setReceiver(id);
    directChat.clearMessage();
}

window.onload = () => {
    const logoutButton = document.getElementById("logout-button");

    const globalChatElement = document.querySelector("#global-chat");
    const directChatElement = document.querySelector("#direct-chat");

    const friendSearchBar = document.querySelector("#search-friend input");
    const friendList = document.getElementById("friend-list");

    logoutButton.onclick = () => {
        document.cookie = `userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;username=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        window.location.href = "/";
    };

    globalChat.init(globalChatElement, webSocket);
    directChat.init(directChatElement, webSocket);

    friendSearcher.init(friendSearchBar, friendList);
};

webSocket.onmessage = event => {
    const { uuid, message, sender, senderId, isGlobal } = JSON.parse(event.data);

    if (uuid) {
        connectionSession = uuid;
        return;
    }
    if (notification.needsNotificationSound()) {
        notification.playNotificationSound();
    }

    if (isGlobal) {
        globalChat.appendMessage({ sender, message });
    } else {
        if (+senderId === +chattingId || +senderId === +cookies.userId) {
            directChat.appendMessage({ sender, message });
        }
    }
};

setInterval(() => {
    webSocket.send("ping");
}, 30000);

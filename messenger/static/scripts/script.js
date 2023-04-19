"use strict";

let shiftPressed = false;

const notification = new Notify("./static/audio/notification.mp3");
const friendSearcher = new FriendSearcher();
const globalChat = new MessageBox();

let connectionSession = null;

const cookies = {};
document.cookie
    .split(";")
    .map(x => ({
        name: x.split("=")[0].trim(),
        value: x.split("=")[1].trim()
    }))
    .forEach(x => (cookies[x.name] = x.value));

const domain = "f6bd-2001-d08-d3-66ab-4c00-3954-6572-222b.ngrok-free.app";
//const webSocket = new WebSocket(`wss://${domain}/ws/${cookies.userId}`, "echo-protocol");
const webSocket = new WebSocket(`ws://localhost:8080/ws/${cookies.userId}`, "echo-protocol");

function submitDirectMessage(e) {
    e.preventDefault();
}

function submitGlobalMessage(e) {
    e.preventDefault();
    const messageBox = document.querySelector("#global-chat .message-box");
    if (messageBox.innerText.trimEnd() === "") return;
    webSocket.send(JSON.stringify({ sessionId: connectionSession, global: true, message: messageBox.innerText.trimEnd() }));
    messageBox.innerText = "";
}

window.onload = () => {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.onclick = () => {
        document.cookie = "userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;username=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    };

    const globalChatElement = document.querySelector("#global-chat");
    globalChat.init(globalChatElement, webSocket);
    const directMessageForm = document.querySelector("#direct-chat .input-form");
    directMessageForm.onsubmit = submitDirectMessage;
    const directMessageBox = document.querySelector("#direct-chat .message-box");

    const shiftKeyUp = e => {
        if (e.key === "Shift") {
            shiftPressed = false;
        }
    };

    directMessageBox.onkeydown = e => {
        if (e.key === "Shift") {
            shiftPressed = true;
        }
        if (!shiftPressed && e.key === "Enter") {
            submitDirectMessage(e);
        }
    };

    directMessageBox.onkeyup = shiftKeyUp;

    const friendSearchBar = document.querySelector("#search-friend input");
    const friendList = document.getElementById("friend-list");
    
    friendSearcher.init(friendSearchBar, friendList);
};

webSocket.onmessage = event => {
    const globalChatDisplay = document.querySelector("#global-chat .chat-display");
    const globalChatDisplayNotificationText = document.querySelector("#global-chat .new-notification");
    const { uuid, message: messageText, sender } = JSON.parse(event.data);

    if (uuid) {
        connectionSession = uuid;
        return;
    }
    if (notification.needsNotificationSound()) {
        notification.playNotificationSound();
    }
    globalChat.appendMessage({sender, message: messageText});
};

setInterval(() => {
    webSocket.send("ping");
}, 30000);

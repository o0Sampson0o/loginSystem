"use strict";

let shiftPressed = false;

const notification = new Notify();
const friendSearcher = new FriendSearcher();
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

const globalChat = new MessageBox(true, webSocket);
const directChat = new MessageBox(false, webSocket);
window.onload = () => {
    notification.init("./static/audio/notification.mp3");

    const logoutButton = document.getElementById("logout-button");
    const globalChatElement = document.querySelector("#global-chat");
    const directChatElement = document.querySelector("#direct-chat");
    
    logoutButton.onclick = () => {
        document.cookie = "userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;username=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    };
    
    globalChat.init(globalChatElement, webSocket);
    directChat.init(directChatElement, webSocket);
    directMessageForm.onsubmit = submitDirectMessage;
    
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
    const { uuid, message, sender, isGlobal } = JSON.parse(event.data);

    if (uuid) {
        connectionSession = uuid;
        return;
    }
    if (notification.needsNotificationSound()) {
        notification.playNotificationSound();
    }

    if (isGlobal) {
        globalChat.appendMessage({sender, message});
    }else {
        directChat.appendMessage({sender, message});
    }
};

setInterval(() => {
    webSocket.send("ping");
}, 30000);
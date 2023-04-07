let shiftPressed = false;

const audio = new Audio("./static/audio/notification.mp3");

let needsNotify = false;

function notifySound() {
    audio.play();
}

let connectionSession = null;

const cookies = {};
document.cookie
    .split(";")
    .map(x => ({
        name: x.split("=")[0].trim(),
        value: x.split("=")[1].trim()
    }))
    .forEach(x => (cookies[x.name] = x.value));

const domain = "3773-2001-d08-d3-66ab-4da0-519b-16eb-6174.ap.ngrok.io";
const webSocket = new WebSocket(`wss://${domain}/ws/${cookies.userId}`, "echo-protocol");
//const webSocket = new WebSocket(`ws://localhost:8080/ws/${cookies.userId}`, "echo-protocol");

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

function trySubmit(e) {
    if (e.key === "Shift") {
        shiftPressed = true;
    }
    if (!shiftPressed && e.key === "Enter") {
        e.preventDefault();
    }
}
window.onload = () => {

    window.onfocus = () => {
        needsNotify = false;
    };
    
    window.onblur = () => {
        needsNotify = true;
    };

    const logoutButton = document.getElementById("logout-button");
    logoutButton.onclick = () => {
        document.cookie = "userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;username=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
    };
    
    const directMessageForm = document.querySelector("#direct-chat .input-form");
    const globalMessageForm = document.querySelector("#global-chat .input-form");
    directMessageForm.onsubmit = submitDirectMessage;
    globalMessageForm.onsubmit = submitGlobalMessage;
    const directMessageBox = document.querySelector("#direct-chat .message-box");
    const globalMessageBox = document.querySelector("#global-chat .message-box");
    
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
    
    globalMessageBox.onkeydown = e => {
        if (e.key === "Shift") {
            shiftPressed = true;
        }
        if (!shiftPressed && e.key === "Enter") {
            submitGlobalMessage(e);
        }
    };
    
    directMessageBox.onkeyup = shiftKeyUp;
    globalMessageBox.onkeyup = shiftKeyUp;
    
    
    const globalChatDisplay = document.getElementById("global-chat-display");
    const globalChatDisplayNotificationText = document.querySelector("#global-chat .new-notification");

    globalChatDisplay.onscroll = () => {
        if (globalChatDisplay.scrollTop > globalChatDisplay.scrollHeight - 500) {
            globalChatDisplay.classList.remove("chat-display-new-notification");
            globalChatDisplayNotificationText.style.opacity = 0;
        }
    }
};


webSocket.onmessage = event => {
    const globalChatDisplay = document.getElementById("global-chat-display");
    const globalChatDisplayNotificationText = document.querySelector("#global-chat .new-notification");
    const {uuid, message : messageText, sender } = JSON.parse(event.data);

    if (uuid) {
        connectionSession = uuid;
        return;
    }
    if (needsNotify) {
        notifySound();
    }
    if (globalChatDisplay.scrollTop < globalChatDisplay.scrollHeight - 800) {
        globalChatDisplay.classList.add("chat-display-new-notification");
        globalChatDisplayNotificationText.style.opacity = 1;
    }
    const message = document.createElement("div");
    message.className = "message";
    message.innerText = `${sender}: ${messageText}`;
    globalChatDisplay.appendChild(message);
    if (globalChatDisplay.scrollTop > globalChatDisplay.scrollHeight - 1000) {
        globalChatDisplay.scrollTop = globalChatDisplay.scrollHeight;
    }
};

setInterval(() => {
    webSocket.send("ping");
}, 30000);

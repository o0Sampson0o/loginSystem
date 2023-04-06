let shiftPressed = false;
const webSocket = new WebSocket('wss://localhost:8080/');

let globalChatDisplay;

let cookies = {};
document.cookie.split(";").map(x => ({
    name: x.split("=")[0].trim(),
    value: x.split("=")[1].trim()
})).forEach(x => cookies[x.name] = x.value)

function submitDirectMessage(e) {
    e.preventDefault();
}

function submitGlobalMessage(e) {
    e.preventDefault();
    const directMessageBox = document.querySelector("#global-chat .message-box");
    webSocket.send(JSON.stringify({username: cookies.username, message: directMessageBox.innerText}));
    directMessageBox.innerText = "";
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

    globalChatDisplay = document.getElementById("global-chat-display");


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
};


webSocket.onmessage = event => {
    const message = document.createElement('div');
    message.className = "message";
    message.innerText = event.data;
    globalChatDisplay.appendChild(message);
    console.log(event.data);
};

setInterval(() => {
    webSocket.send("ping");
}, 30000);
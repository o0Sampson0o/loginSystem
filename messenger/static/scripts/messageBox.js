class MessageBox {
    #chatBox;
    #chatDisplay;
    #inputForm;
    #chatInputArea;
    #chatSubmitButton;
    #notificationText;
    #socket;
    #isShiftPressed;
    constructor() {
        this.#isShiftPressed = false;
    }
    init(chatBox, webSocket) {
        const chatBoxElements = Array.from(chatBox.children);
        const inputForm = chatBoxElements.find(x => x.classList.contains("input-form"));
        const inputFormElements = Array.from(inputForm.children);

        this.#socket = webSocket;

        this.#chatBox = chatBox;

        this.#chatDisplay = chatBoxElements.find(x => x.classList.contains("chat-display"));

        this.#inputForm = inputForm;
        this.#chatInputArea = inputFormElements.find(x => x.classList.contains("message-box"));
        this.#chatSubmitButton = inputFormElements.find(x => x.tagName === "INPUT");

        this.#notificationText = chatBoxElements.find(x => x.classList.contains("new-notification"));

        this.#chatDisplay.onscroll = () => {
            if (this.#chatDisplay.scrollTop > this.#chatDisplay.scrollHeight - 500) {
                this.#removeNotification();
            }
        };

        this.#chatInputArea.onkeydown = e => {
            if (e.key === "Shift") {
                this.#isShiftPressed = true;
            }
            if (!this.#isShiftPressed && e.key === "Enter") {
                this.#sendMessage();
            }
        };

        this.#chatInputArea.onkeyup = e => {
            if (e.key === "Shift") {
                this.#isShiftPressed = false;
            }
        };

        this.#inputForm.onsubmit = this.#sendMessage.bind(this);
    }

    #sendMessage(e) {
        e.preventDefault();
        const message = this.#chatInputArea.innerText.trimEnd();
        if (message === "") {
            return;
        }
        this.#socket.send(JSON.stringify({ sessionId: connectionSession, global: true, message }));
        this.#chatInputArea.innerText = "";
    }

    appendMessage(messageObject) {
        const { sender, message } = messageObject;
        if (this.#chatDisplay.scrollTop < this.#chatDisplay.scrollHeight - 800) {
            this.#chatDisplay.classList.add("chat-display-new-notification");
            this.#notificationText.style.opacity = 1;
        }
        const messageContainer = document.createElement("div");
        messageContainer.className = "message";
        messageContainer.innerText = `${sender}: ${message}`;
        this.#chatDisplay.appendChild(messageContainer);
        if (this.#chatDisplay.scrollTop > this.#chatDisplay.scrollHeight - 1000) {
            this.#chatDisplay.scrollTop = this.#chatDisplay.scrollHeight;
        }
    }

    #removeNotification() {
        this.#chatDisplay.classList.remove("chat-display-new-notification");
        this.#notificationText.style.opacity = 0;
    }
}

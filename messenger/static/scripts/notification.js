class Notify {
    #needsNotificationSound;
    #notificationSound;
    constructor(path) {
        this.#notificationSound = new Audio(path);
        this.#needsNotificationSound = false;
        window.onfocus = () => {
            this.#needsNotificationSound = false;
        };

        window.onblur = () => {
            this.#needsNotificationSound = true;
        };
    }

    needsNotificationSound() {
        return this.#needsNotificationSound;
    }
    playNotificationSound() {
        this.#notificationSound.play();
    }
}
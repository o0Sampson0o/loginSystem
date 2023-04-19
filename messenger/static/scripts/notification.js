class Notify {
    #needsNotificationSound;
    #notificationSound;
    constructor(path) {
        this.init(path);
    }
    
    init(path) {
        this.#needsNotificationSound = true;
        this.#notificationSound = new Audio(path);
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
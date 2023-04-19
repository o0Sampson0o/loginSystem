class FriendSearcher {
    #searchbar;
    #list;
    #latestSearchedName;
    #previousSearchTime;
    #timeout;
    constructor() {
        this.#latestSearchedName = "";
        this.#previousSearchTime = new Date(Date.now() - 1000);
    }

    init(searchBar, list) {
        this.#searchbar = searchBar;
        this.#list = list;
        this.#searchbar.onkeydown = this.#search.bind(this);
    }

    #search(e) {
        if (Date.now() - this.#previousSearchTime > 500) {
            const name = this.#searchbar.value + (e?.key?.length === 1 ? e.key : "");
            this.#previousSearchTime = Date.now();
            if (name.length === 0 || name === this.#latestSearchedName) {
                if (name.length === 0) {
                    this.#list.innerHTML = "";
                }
                clearTimeout(this.#timeout);
                return;
            }
            clearTimeout(this.#timeout);
            this.#timeout = setTimeout(this.#search.bind(this), 500);
            this.#latestSearchedName = name;
            fetch(`/messenger/getFriend/${name}`, {
                method: "GET"
            })
                .then(httpRes => {
                    if (!httpRes.ok) throw new Error(`HTTP error, status = ${httpRes.status}`);
                    return httpRes.text();
                })
                .then(text => {
                    const friends = JSON.parse(text).map(x => x.displayName);
                    this.#list.innerHTML = "";
                    const friendElements = friends.map(x => {
                        const li = document.createElement("li");
                        li.innerText = x;
                        return li;
                    });
                    friendElements.forEach(x => this.#list.appendChild(x));
                });
        }
    }
}

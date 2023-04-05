window.onload = () => {
    const logoutButton = document.getElementById("logout-button");
    logoutButton.onclick = () => {
        document.cookie = "userId=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href ="/";
    }
}
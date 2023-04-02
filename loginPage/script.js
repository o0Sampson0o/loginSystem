"use strict";

function submitForm(event) {
    event.preventDefault();
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const bodyData = {username: username.value, password: password.value};
    fetch(`http://localhost:8080/login/api`, {
        method: "POST",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyData)
    })
    .then(httpResponse => {
        if (!httpResponse.ok) throw new Error(`HTTP error, status = ${response.status}`);
        return httpResponse.text();
    })
    .then(text => {
        const message = document.getElementById("message");
        message.innerText = text;
    })
    .catch(error => {
        console.error(`Error: ${error.message}`);
    });
}

window.onload = () => {
    const form = document.getElementById("form");
    form.onsubmit = submitForm;
};

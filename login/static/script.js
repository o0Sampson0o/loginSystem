"use strict";

function submitForm(event) {
    event.preventDefault();
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const usernameErrorMessage = document.getElementById("username-error-message");
    const passwordErrorMessage = document.getElementById("password-error-message");
    const bodyData = { username: username.value, password: password.value };
    let validationMessage;
    validationMessage = validateUsername(username.value);
    let isOk = true;
    username.classList.remove("error");
    password.classList.remove("error");
    usernameErrorMessage.innerText = "";
    passwordErrorMessage.innerText = "";
    if (validationMessage !== "ok") {
        username.classList.add("error");
        usernameErrorMessage.innerText = validationMessage;
        isOk = false;
    }
    validationMessage = validatePassword(password.value);
    if (validationMessage !== "ok") {
        password.classList.add("error");
        passwordErrorMessage.innerText = validationMessage;
        isOk = false;
    }
    if (!isOk) return;

    fetch(`/login/api`, {
        method: "POST",
        cache: "no-cache",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(bodyData)
    })
        .then(httpResponse => {
            if (!httpResponse.ok) throw new Error(`HTTP error, status = ${httpResponse.status}`);
            return httpResponse.text();
        })
        .then(text => {
            if (text != "Logged in.") {
                username.classList.add("error");
                usernameErrorMessage.innerText = text;
            } else {
                window.location.href = "/messenger/";
            }
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
        });
}

window.onload = () => {
    const form = document.getElementById("form");
    form.onsubmit = submitForm;
};

function validateUsername(username) {
    if (username.length === 0) {
        return "username cannot be empty";
    }
    return "ok";
}

function validatePassword(password) {
    if (password.length === 0) {
        return "password cannot be empty";
    }
    return "ok";
}

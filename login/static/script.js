"use strict";

const statusToMsgMapper = {
    OK: "ok",
    PASS_EMPTY: "password cannot be empty",
    USERNAME_EMPTY: "username cannot be empty"
};

function handleLogin(event) {
    event.preventDefault();

    let isOk = true;
    let validationMessage = "";

    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const usernameErrorMessage = document.getElementById("username-error-message");
    const passwordErrorMessage = document.getElementById("password-error-message");

    const bodyData = {
        username: username.value,
        password: password.value
    };

    username.classList.remove("error");
    password.classList.remove("error");

    usernameErrorMessage.innerText = "";
    passwordErrorMessage.innerText = "";

    validationMessage = validateUsername(username.value);

    if (validationMessage !== statusToMsgMapper.OK) {
        username.classList.add("error");
        usernameErrorMessage.innerText = validationMessage;
        isOk = false;
    }

    validationMessage = validatePassword(password.value);

    if (validationMessage !== statusToMsgMapper.OK) {
        password.classList.add("error");
        passwordErrorMessage.innerText = validationMessage;
        isOk = false;
    }

    if (!isOk) {
        return;
    }

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
    const loginForm = document.getElementById("form");
    loginForm.onsubmit = handleLogin;
};

function validateUsername(username) {
    if (username.length === 0) {
        return statusToMsgMapper.USERNAME_EMPTY;
    }
    return statusToMsgMapper.OK;
}

function validatePassword(password) {
    if (password.length === 0) {
        return statusToMsgMapper.PASS_EMPTY;
    }
    return statusToMsgMapper.OK;
}

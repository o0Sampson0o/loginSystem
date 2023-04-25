"use strict";

const statusToMsgMapper = {
    OK: "ok",
    PASS_EMPTY: "password cannot be empty",
    USERNAME_EMPTY: "username cannot be empty",
    USERNAME_EXIST: "username already exist",
    PASS_NOT_MATCH: "passwords does not match",
    PASS_NOT_LONG: "password needs to be at least 8 character"
};

function submitForm(event) {
    event.preventDefault();

    let isOk = true;
    let validationMessage = "";
    
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");
    const usernameErrorMessage = document.getElementById("username-error-message");
    const passwordErrorMessage = document.getElementById("password-error-message");
    const confirmPasswordErrorMessage = document.getElementById("confirm-password-error-message");
    
    const bodyData = {
        username: username.value,
        password: password.value
    };
    
    username.classList.remove("error");
    password.classList.remove("error");
    confirmPassword.classList.remove("error");
    
    usernameErrorMessage.innerText = "";
    passwordErrorMessage.innerText = "";
    confirmPasswordErrorMessage.innerText = "";
    
    validationMessage = validateUsername(username.value);
    
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

    validationMessage = validateConfirmPassword(password.value, confirmPassword.value);
    
    if (validationMessage !== "ok") {
        confirmPassword.classList.add("error");
        confirmPasswordErrorMessage.innerText = validationMessage;
        isOk = false;
    }

    if (!isOk) {
        return;
    }
    
    fetch(`/signup/api`, {
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
            if (!httpResponse.ok) throw new Error(`HTTP error, status = ${response.status}`);
            return httpResponse.text();
        })
        .then(text => {
            if (text === "success") window.location.href = "/";
            else {
                username.classList.add("error");
                usernameErrorMessage.innerText = statusToMsgMapper.USERNAME_EXIST;
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
        return statusToMsgMapper.USERNAME_EMPTY;
    }
    return statusToMsgMapper.OK;
}

function validatePassword(password) {
    if (password.length === 0) {
        return statusToMsgMapper.PASS_EMPTY;
    } else if (password.length < 8) {
        return PASS_NOT_LONG;
    }
    return statusToMsgMapper.OK;
}

function validateConfirmPassword(password, confirmPassword) {
    if (confirmPassword !== password) {
        return PASS_NOT_MATCH;
    }
    return statusToMsgMapper.OK;
}

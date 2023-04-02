"use strict";

function submitForm(event) {
    event.preventDefault();
    const message = document.getElementById("message");
    const username = document.getElementById("username");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const bodyData = {username: username.value, password: password.value};
    let validationMessage;
    validationMessage = validateUsername(username.value);
    if (validationMessage !== 'ok') {
        message.innerText = validationMessage;
        return;
    }
    validationMessage = validatePassword(password.value, confirmPassword.value);
    if (validationMessage !== 'ok') {
        message.innerText = validationMessage;
        return;
    }
    fetch(`http://localhost:8080/signup/api`, {
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
        message.innerText = text;
        if (text === "success") window.location.replace("http://localhost:8080/login");
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
    return 'ok';
}

function validatePassword(password, confirmPassword) {
    if (password.length === 0) {
        return "password cannot be empty";
    } else if (password.length < 8) {
        return "password needs to be at least 8 character";
    } else if (confirmPassword !== password) {
        return "the two passwords does not match";
    }
    return 'ok';
}
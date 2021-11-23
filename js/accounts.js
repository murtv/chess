function createAccount(details) {
    const { email } = details;

    if (localStorage.getItem(email) !== null) {
        throw Error('A user with this email already exists.');
    }

    const accountJSON = JSON.stringify({
        ...details,
        score: 0
    });

    localStorage.setItem(email, accountJSON);
}

function authenticate(details) {
    const { email, password } = details;

    const accountJSON = localStorage.getItem(email);
    const account = JSON.parse(accountJSON);

    if (accountJSON === null ||
        account.password !== password) {
        throw Error('A user with this email does not exist.');
    }
}
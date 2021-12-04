function createAccount(fields) {
    const { email } = fields;

    if (localStorage.getItem(email) !== null) {
        throw Error('A user with this email already exists.');
    }

    // add a default score field
    const account = { ...fields, score: 10 };
    const accountJSON = JSON.stringify(account);

    localStorage.setItem(email, accountJSON);
}

function authenticate(fields) {
    const { email, password } = fields;

    // account does not exist
    const accountJSON = localStorage.getItem(email);
    if (!accountJSON) {
        throw Error('Invalid credentials.');
    }

    // passwords do not match
    const account = JSON.parse(accountJSON);
    if (account.password !== password) {
        throw Error('Invalid credentials');
    }
}

// schema for login validation (see validation.js)
const loginRules = {
    email1: {
        label: 'Player 1 email',
        rules: [
            isRequired(),
            isEmail()
        ]
    },
    password1: {
        label: 'Player 1 password',
        rules: [
            isRequired(),
            isMinLength({ min: 8  })
        ]
    },
    email2: {
        label: 'Player 2 email',
        rules: [
            isRequired(),
            isEmail()
        ]
    },
    password2: {
        label: 'Player 2 password',
        rules: [
            isRequired(),
            isMinLength({ min: 8  })
        ]
    },
};

function handleLogin() {
    // fetch the form values
    const fields = fetchFields(
        'email1', 'password1', 'email2', 'password2');

    const {
        email1, password1,
        email2, password2
    } = fields;

    // perform field level validation
    try {
        validate(fields, loginRules);

        // player 1 and 2 must not be the same
        if (email1 === email2) {
            throw Error('Make friends.'); // wisecrackery
        }

    } catch (error) {
        showFormError(error.message); // if validation fails, show error div and abort
        return;
    }

    // authenticate both  players
    // note: we use two try-catch blocks so we can each players error message seperately
    try {
        authenticate({
            email: email1,
            password: password1
        });
    } catch (error) {
        showFormError(`Player 1: ${error.message}`);
        return;
    }

    try {
        authenticate({
            email: email2,
            password: password2
        });
    } catch (error) {
        showFormError(`Player 2: ${error.message}`);
    }

    // if we get here, that means validation was successful,
    // set local storage values and send user to the game page
    localStorage.setItem('loggedInUser1', email1);
    localStorage.setItem('loggedInUser2', email2);

    window.location = 'game.html';
}

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

// authenticate both users, set localstorage values and send to the game page
function handleLogin() {
    const fields = fetchFields(
        'email1', 'password1', 'email2', 'password2');

    const {
        email1, password1,
        email2, password2
    } = fields;

    try {
        validate(fields, loginRules);

        if (email1 === email2) {
            throw Error('Make friends.');
        }

    } catch (error) {
        showFormError(error.message);
        return;
    }

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

    localStorage.setItem('loggedInUser1', email1);
    localStorage.setItem('loggedInUser2', email2);

    window.location = 'game.php';
}

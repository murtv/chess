// rules for sign up validation (see validation.js)
const signUpRules = {
    name: {
        label: 'Name',
        rules: [
            isRequired()
        ]
    },
    email: {
        label: 'Email',
        rules: [
            isRequired(),
            isEmail()
        ]
    },
    phone: {
        label: 'Phone',
        rules: [
            isRequired(),
            isNumber(),
            isMinLength({ min: 10 })
        ],
    },
    password: {
        label: 'Password',
        rules: [
            isRequired(),
            isMinLength({ min: 8 })
        ]
    },
};


// if signup is successful, send to the login page
function handleSignUp() {
    try {
        const fields = fetchFields(
            'name', 'email', 'phone', 'password');

        validate(fields, signUpRules);

        createAccount(fields);

        window.location = 'index.php';
    } catch (error) {
        showFormError(error.message);
    }
}

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

function handleSignUp() {
    try {
        // fetch form values
        const fields = fetchFields(
            'name', 'email', 'phone', 'password');

        // vaidate fields against the sign up schema
        validate(fields, signUpRules);

        createAccount(fields);

        // if account creation is successful, send user to the login page
        window.location = 'index.html';
    } catch (error) {
        showFormError(error.message); // show error div
    }
}

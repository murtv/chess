const signUpSchema = {
    name: [required],
    email: [required, isEmail],
    phone: [required, isNumber, minLength(10)],
    password: [required, minLength(8)],
};

function handleSignUp() {
    try {
        const input = fetchFieldValues(
            'name', 'email', 'phone', 'password');

        validate(input, signUpSchema);
        createAccount(input);

        window.location = 'index.html';
    } catch (error) {
        showFormError(error.message);
    }
}

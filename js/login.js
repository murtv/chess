const loginSchema = {
    email1: [required, isEmail],
    password1: [required, minLength(8)],

    email2: [required, isEmail],
    password2: [required, minLength(8)],
};

function handleLogin() {
    const input = fetchFieldValues(
        'email1', 'password1', 'email2', 'password2');

    try {
        validate(input, loginSchema);

        if (input.email1 === input.email2)
            throw Error('Make friends.');
    } catch (error) {
        showFormError(error.message);
        return;
    }

    try {
        authenticate({
            email: input.email1,
            password: input.password1
        });
    } catch (error) {
        showFormError(`player 1: ${error.message}`);
        return;
    }

    try {
        authenticate({
            email: input.email2,
            password: input.password2
        });

    } catch (error) {
        showFormError(`player 2: ${error.message}`);
    }

    localStorage.setItem('loggedInUser1', input.email1);
    localStorage.setItem('loggedInUser2', input.email2);

    window.location = 'game.html';
}
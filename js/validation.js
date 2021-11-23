const required = {
    validate: (input) => {
        if (input === undefined) return false;
        if (input.trim() === '') return false;

        return true;
    },
    errorMessage: (field) => `${field} is must not be empty.`
};

const isEmail = {
    validate: (input) =>
        new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+")
            .test(input),
    errorMessage: (field) => `${field} must be valid.`
};

const isNumber = {
    validate: (input) => !isNaN(input.trim()),
    errorMessage: (field) => `${field} must be a number.`
};

const minLength = (num) => {
    return {
        validate: (input) => input.length >= num,
        errorMessage: (field) => `${field} must be at least ${num} characters long.`
    };
};

function validate(inputData, schema) {
    for (const field of Object.keys(inputData)) {
        for (const rule of schema[field]) {
            if (!rule.validate(inputData[field])) {
                throw Error(rule.errorMessage(field));
            }
        }
    }
}
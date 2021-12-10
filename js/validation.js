// this file defines reusable, composable rules that are used to build a validation schema
// see login.js or signup.js for the schema structure
//
function isRequired(options = {}) {
    const { error } = options;

    return {
        isValid: (value) => !isStringEmpty(value),
        getError: (label) => error || `${label} is empty.`
    };
}

function isEmail(options = {}) {
    const { error } = options;

    return {
        isValid: (value) => new RegExp(emailRegex).test(value),
        getError: (label) => error || `${label} is not valid.`
    };
}

function isNumber(options = {}) {
    const { error } = options;

    return {
        isValid: (value) => !isNaN(value.trim()),
        getError: (label) => error || `${label} is not a number.`
    };
}

function isMinLength(options = {}) {
    const { min, error } = options;

    return {
        isValid: (value) => value.length >= min,
        getError: (label) => error || `${label} must be at least ${min} chars long.`
    };
}

// validates a field object against a schema object
function validate(fields, schema) {
    // for every field, every rule must pass
    for (const [field, value] of Object.entries(fields)) {
        const { label, rules } = schema[field];

        for (const rule of rules) {
            if (!rule.isValid(value)) {
                throw Error(rule.getError(label));
            }
        }
    }
}

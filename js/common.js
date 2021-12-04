// show the error div with the given message
// note: we'll never need a hideFormError function since successful validation just moves you to another page
function showFormError(message, errorId = 'error') {
    const errorEl = document.getElementById(errorId);

    errorEl.hidden = false;
    errorEl.textContent = message;
}

// create an object with the form values for the given field ids
function fetchFields(...fieldIds) {
    const fields = {};

    // for every fieldId, assign the value to the fields obj under fieldId key
    fieldIds.forEach((fieldId) => {
        fields[fieldId] = document
            .getElementById(fieldId)
            .value;
    });

    return fields;
}

function isStringEmpty(string) {
    if (!string) return true;

    if (string.trim().length === 0) return true;

    return false;
}

const emailRegex = new RegExp("[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+");

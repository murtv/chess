function showFormError(message) {
    const errorEl = document.getElementById('error');
    errorEl.hidden = false;
    errorEl.textContent = message;
}

function fetchFieldValues(...fieldIds) {
    const obj = {};
    fieldIds.forEach((fieldId) => {
        obj[fieldId] = document.getElementById(fieldId).value;
    });
    return obj;
}

// fetch users, sort them by score, then populate the table with them
function initRankingsTable() {
    const users = fetchUsers();

    users.sort(sortByScore); // sort in place

    const table = document.getElementById('rankings-table');

    users.forEach((user, index) => {
        const { name, score } = user;
        const rank = index + 1 // use the index as rank, but add 1 since index starts with 0

        insertTableRow(table, [rank, name, score]);
    });
}

// keys to ignore when looping over all local storage fields (we only want user accounts)
const keysToIgnore = ['loggedInUser1', 'loggedInUser2'];

// get all local storage keys, remove keys to ignore,
// map the remaning keys to their values, then map those values to parsed objects
function fetchUsers() {
    return Object.keys(localStorage)
        .filter((key) => !keysToIgnore.includes(key))
        .map((key) => localStorage.getItem(key))
        .map((json) => JSON.parse(json));
}

// insert and populate a row
function insertTableRow(table, cells) {
    const row = table.insertRow();

    cells.forEach((cell, index) => {
        const cellEl = row.insertCell(index);
        cellEl.innerHTML = cell;
    });
}

// callback to pass in the array sort function
function sortByScore(userA, userB) {
    if (userA.score > userB.score) return -1;
    if (userA.score < userB.score) return 1;
    return 0;
}

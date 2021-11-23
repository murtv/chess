function initRankingsTable() {
    const users = Object.keys(localStorage)
        .filter((key) => (key !== 'loggedInUser1') || (key !== 'loggedInUser2'))
        .map((key) => JSON.parse(localStorage.getItem(key)));

    users.sort(sortByScore);

    const table = document.getElementById('rankings-table');

    users.forEach((user, index) => {
        insertTableRow(
            table,
            index + 1,
            user.name,
            user.score
        );
    });
}

function insertTableRow(table, rank, name, score) {
    const row = table.insertRow();

    const rankCell = row.insertCell(0);
    rankCell.innerHTML = rank;

    const nameCell = row.insertCell(1);
    nameCell.innerHTML = name;

    const scoreCell = row.insertCell(2);
    scoreCell.innerHTML = score;
}

function sortByScore(userA, userB) {
    if (userA.score > userB.score) return -1;
    if (userA.score < userB.score) return 1;
    return 0;
}
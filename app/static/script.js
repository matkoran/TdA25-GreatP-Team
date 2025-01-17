const grid = document.getElementById('gameGrid');
const currentPlayerDisplay = document.getElementById('currentPlayer');

// Defaultní jména hráčů
let playerNames = ["Hráč 1", "Hráč 2"];
let currentPlayerIndex = 0; // Index aktuálního hráče (0 nebo 1)

// Inicializace hracího pole
const createGrid = () => {
    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.addEventListener('click', handleCellClick);
            grid.appendChild(cell);
        }
    }
};

// Zpracování kliknutí na políčko
const handleCellClick = async (event) => {
    const cell = event.target;
    const x = parseInt(cell.dataset.x);
    const y = parseInt(cell.dataset.y);

    const currentPlayer = parseInt(currentPlayerDisplay.textContent);

    // Odeslání požadavku na server
    const response = await fetch('/api/play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y, player: currentPlayer })
    });

    const result = await response.json();

    if (result.success) {
        cell.textContent = currentPlayer === 1 ? 'X' : 'O';
        currentPlayerDisplay.textContent = currentPlayer === 1 ? '2' : '1';

        if (result.winner) {
            alert(`Hráč ${result.winner} vyhrál! Hra se restartuje.`);
            window.location.href = '/';
        }
    } else {
        alert(result.message);
    }
};

// Aktualizace jmen hráčů
const updateNames = () => {
    const player1Name = document.getElementById('player1').value.trim();
    const player2Name = document.getElementById('player2').value.trim();

    // Použijeme výchozí jméno, pokud není zadáno nic
    playerNames[0] = player1Name || "Hráč 1";
    playerNames[1] = player2Name || "Hráč 2";

    // Aktualizujeme zobrazeného aktuálního hráče
    currentPlayerDisplay.textContent = playerNames[currentPlayerIndex];
};

// Event listener pro tlačítko aktualizace jmen
document.getElementById('updateNames').addEventListener('click', updateNames);


// Vytvoření herního pole při načtení stránky
createGrid();

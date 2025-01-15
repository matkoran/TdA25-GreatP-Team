const grid = document.getElementById('gameGrid');
const currentPlayerDisplay = document.getElementById('currentPlayer');

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
            alert(`Hráč ${result.winner} vyhrál!`);
        }
    } else {
        alert(result.message);
    }
};

// Vytvoření herního pole při načtení stránky
createGrid();

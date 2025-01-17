
const modal = document.getElementById('gameModal');
const closeModal = document.getElementById('closeModal');
const modalGameGrid = document.getElementById('modalGameGrid');
const prevMoveBtn = document.getElementById('prevMove');
const nextMoveBtn = document.getElementById('nextMove');
const stepIndicator = document.getElementById('stepIndicator');
const gameLinks = document.querySelectorAll('.game-link');
const deleteGameBtn = document.getElementById('deleteGame');

const updatePlaceholders = () => {
            const player1Name = localStorage.getItem('player1') || 'Hráč 1';
            const player2Name = localStorage.getItem('player2') || 'Hráč 2';

            document.getElementById('player1').placeholder = player1Name;
            document.getElementById('player2').placeholder = player2Name;
        };

        // Uložení jmen hráčů po kliknutí na "Uložit"
        document.getElementById('saveNames').addEventListener('click', () => {
            const player1Name = document.getElementById('player1').value.trim() || 'Hráč 1';
            const player2Name = document.getElementById('player2').value.trim() || 'Hráč 2';

            // Uložení jmen do localStorage
            localStorage.setItem('player1', player1Name);
            localStorage.setItem('player2', player2Name);

            // Aktualizace placeholderů
            updatePlaceholders();

            // Potvrzení uložení uživateli
            alert('Jména hráčů byla uložena!');
        });

        // Nastavení placeholderů při načtení stránky
        document.addEventListener('DOMContentLoaded', updatePlaceholders);

let currentGame = null;
let currentStep = 0;
let totalSteps = 0;
let allMoves = [];

const fetchAllMoves = async (gameName) => {
    const response = await fetch(`/load_game_data/${gameName}`);
    const data = await response.json();
    return data.moves;
};

const renderFullGameGrid = (moves) => {
    modalGameGrid.innerHTML = '';
    const grid = Array.from({ length: 15 }, () => Array(15).fill(0));

    moves.forEach((move) => {
        grid[move.y][move.x] = move.player;
    });

    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            const cell = document.createElement('div');
            cell.classList.add('game-cell');
            if (grid[y][x] === 1) {
                cell.textContent = 'X';
            } else if (grid[y][x] === 2) {
                cell.textContent = 'O';
            }
            modalGameGrid.appendChild(cell);
        }
    }
};

const renderGameGrid = (step) => {
    modalGameGrid.innerHTML = '';
    const grid = Array.from({ length: 15 }, () => Array(15).fill(0));

    for (let i = 0; i <= step; i++) {
        const move = allMoves[i];
        grid[move.y][move.x] = move.player;
    }

    for (let y = 0; y < 15; y++) {
        for (let x = 0; x < 15; x++) {
            const cell = document.createElement('div');
            cell.classList.add('game-cell');
            if (grid[y][x] === 1) {
                cell.textContent = 'X';
            } else if (grid[y][x] === 2) {
                cell.textContent = 'O';
            }
            modalGameGrid.appendChild(cell);
        }
    }
};

const updateControls = () => {
    stepIndicator.textContent = `Tah: ${currentStep + 1}`;
    prevMoveBtn.disabled = currentStep <= 0;
    nextMoveBtn.disabled = currentStep >= totalSteps - 1;
};

const showModal = async (gameName) => {
    currentGame = gameName;
    allMoves = await fetchAllMoves(gameName);
    totalSteps = allMoves.length;
    currentStep = totalSteps - 1;

    // Zobrazit celé hrací pole
    renderFullGameGrid(allMoves);
    updateControls();

    modal.style.display = 'flex';
};

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

prevMoveBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep -= 1;
        renderGameGrid(currentStep);
        updateControls();
    }
});

nextMoveBtn.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
        currentStep += 1;
        renderGameGrid(currentStep);
        updateControls();
    }
});

gameLinks.forEach(link => {
    link.addEventListener('click', async (event) => {
        event.preventDefault();
        const gameName = link.dataset.game;
        await showModal(gameName);
    });
});

deleteGameBtn.addEventListener('click', async () => {
    if (confirm(`Opravdu chcete smazat hru "${currentGame}"?`)) {
        const response = await fetch(`/delete_game/${currentGame}`, { method: 'DELETE' });

        if (response.ok) {
            alert('Hra byla úspěšně smazána.');
            modal.style.display = 'none';
            location.reload(); // Reload the page to update the game list
        } else {
            alert('Chyba při mazání hry.');
        }
    }
});

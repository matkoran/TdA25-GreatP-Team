        // Načtení jmen hráčů z localStorage
        const player1Name = localStorage.getItem('player1') || 'Hráč 1';
        const player2Name = localStorage.getItem('player2') || 'Hráč 2';
        const currentPlayerDisplay = document.getElementById('currentPlayer');

        // Zobrazí aktuálního hráče
        currentPlayerDisplay.textContent = player1Name;

        // Využití zadaných jmen v logice hry
        const grid = document.getElementById('gameGrid');

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

        const handleCellClick = async (event) => {
            const cell = event.target;
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            const currentPlayer = currentPlayerDisplay.textContent === player1Name ? 1 : 2;
        
            const response = await fetch('/api/play', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x, y, player: currentPlayer })
            });
        
            const result = await response.json();
        
            if (result.success) {
                // Nastavení textu a barvy podle aktuálního hráče
                if (currentPlayer === 1) {
                    cell.textContent = 'X';
                    cell.classList.add('player1'); // Přidání třídy pro modré X
                } else {
                    cell.textContent = 'O';
                    cell.classList.add('player2'); // Přidání třídy pro červené O
                }
                
                currentPlayerDisplay.textContent = currentPlayer === 1 ? player2Name : player1Name;
        
                if (result.winner) {
                    alert(`Hráč ${result.winner === 1 ? player1Name : player2Name} vyhrál! Hra se restartuje.`);
                    window.location.href = '/';
                }
            } else {
                alert(result.message);
            }
        };
        
        createGrid();
        
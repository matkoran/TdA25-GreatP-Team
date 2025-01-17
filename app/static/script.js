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
                    cell.classList.add('player1');
                } else {
                    cell.textContent = 'O';
                    cell.classList.add('player2');
                }
                
                currentPlayerDisplay.textContent = currentPlayer === 1 ? player2Name : player1Name;
        
                if (result.winner) {
                    alert(`Hráč ${result.winner === 1 ? player1Name : player2Name} vyhrál!`);
                    console.log(document.querySelector('.cell').offsetWidth);
                    console.log(result.winningCombination);
        
                    if (result.winningCombination) {
                        drawWinningLine(result.winningCombination);
                    }
        
                    setTimeout(() => window.location.href = '/', 3000);
                }
            } else {
                alert(result.message);
            }
        };
        const testLine = document.createElement('div');
testLine.classList.add('winning-line');
testLine.style.width = '200px';
testLine.style.height = '4px';
testLine.style.backgroundColor = 'blue';
testLine.style.position = 'absolute';
testLine.style.left = '100px';
testLine.style.top = '100px';
document.getElementById('gameGrid').appendChild(testLine);
        
        // Funkce pro vykreslení čáry přes výherní kombinaci
        const drawWinningLine = (combination) => {
            const grid = document.getElementById('gameGrid');
        
            // První a poslední buňka výherní kombinace
            const firstCell = combination[0];
            const lastCell = combination[combination.length - 1];
        
            // Souřadnice prvního a posledního bodu
            const startX = firstCell.x * 40 + 20; // 40px = velikost buňky, 20px = polovina buňky
            const startY = firstCell.y * 40 + 20;
            const endX = lastCell.x * 40 + 20;
            const endY = lastCell.y * 40 + 20;
        
            // Vytvoření elementu pro čáru
            const line = document.createElement('div');
            line.classList.add('winning-line');
        
            // Nastavení pozice a rotace čáry
            const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
            const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        
            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${startX}px`;
            line.style.top = `${startY}px`;
        
            // Přidání čáry do gridu
            grid.appendChild(line);
        };
        
        
        createGrid();
        
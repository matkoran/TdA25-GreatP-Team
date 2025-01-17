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
        
                    if (result.winningCombination) {
                        drawWinningLine(result.winningCombination);
                    }
        
                    setTimeout(() => window.location.href = '/', 3000);
                }
            } else {
                alert(result.message);
            }
        };
        
        // Funkce pro vykreslení čáry přes výherní kombinaci
        const drawWinningLine = (combination) => {
            const grid = document.getElementById('gameGrid');
            
            // Souřadnice prvního a posledního bodu výherní kombinace
            const firstCell = combination[0];
            const lastCell = combination[combination.length - 1];
        
            // Přepočet souřadnic na pixely
            const cellSize = document.querySelector('.cell').offsetWidth; // Dynamicky zjistí velikost buňky
            const startX = firstCell.x * cellSize + cellSize / 2;
            const startY = firstCell.y * cellSize + cellSize / 2;
            const endX = lastCell.x * cellSize + cellSize / 2;
            const endY = lastCell.y * cellSize + cellSize / 2;
        
            // Výpočet délky a úhlu čáry
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx ** 2 + dy ** 2);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
            // Vytvoření čáry
            const line = document.createElement('div');
            line.classList.add('winning-line');
        
            // Stylování čáry
            line.style.width = `${length}px`;
            line.style.height = '4px'; // Tloušťka čáry
            line.style.backgroundColor = 'red'; // Barva čáry
            line.style.position = 'absolute';
            line.style.transformOrigin = '0 50%'; // Rotace kolem levého středu
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${startX}px`;
            line.style.top = `${startY - 2}px`; // Upraví vertikální pozici čáry (polovina výšky čáry)
        
            // Přidání čáry do gridu
            grid.appendChild(line);
        };
        
        
        
        createGrid();
        
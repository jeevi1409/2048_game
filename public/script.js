class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.gameWon = false;
        this.gameOver = false;
        this.moved = false;
        
        this.tileContainer = document.getElementById('tile-container');
        this.scoreContainer = document.getElementById('current-score');
        this.bestScoreContainer = document.getElementById('best-score');
        this.messageContainer = document.getElementById('game-message');
        this.messageText = document.getElementById('message-text');
        this.restartButton = document.getElementById('restart-btn');
        this.tryAgainButton = document.getElementById('try-again-btn');
        
        this.init();
    }
    
    init() {
        this.setupGrid();
        this.updateScore();
        this.updateDisplay();
        this.bindEvents();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }
    
    setupGrid() {
        this.grid = [];
        for (let row = 0; row < this.size; row++) {
            this.grid[row] = [];
            for (let col = 0; col < this.size; col++) {
                this.grid[row][col] = 0;
            }
        }
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        this.restartButton.addEventListener('click', () => this.restart());
        this.tryAgainButton.addEventListener('click', () => this.restart());
        
        // Touch events for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            let endX = e.changedTouches[0].clientX;
            let endY = e.changedTouches[0].clientY;
            
            let diffX = startX - endX;
            let diffY = startY - endY;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 30) this.move('left');
                else if (diffX < -30) this.move('right');
            } else {
                if (diffY > 30) this.move('up');
                else if (diffY < -30) this.move('down');
            }
            
            startX = 0;
            startY = 0;
        });
    }
    
    handleKeyPress(event) {
        if (this.gameOver) return;
        
        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.move('right');
                break;
        }
    }
    
    move(direction) {
        this.moved = false;
        let previousGrid = this.copyGrid();
        
        switch (direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'left':
                this.moveLeft();
                break;
            case 'right':
                this.moveRight();
                break;
        }
        
        if (this.moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.updateScore();
            
            if (this.hasWon() && !this.gameWon) {
                this.gameWon = true;
                this.showMessage('You Win!');
                this.saveScore();
            } else if (this.isGameOver()) {
                this.gameOver = true;
                this.showMessage('Game Over!');
                this.saveScore();
            }
        }
    }
    
    moveLeft() {
        for (let row = 0; row < this.size; row++) {
            let arr = this.grid[row].filter(val => val !== 0);
            let merged = [];
            
            for (let i = 0; i < arr.length; i++) {
                if (i < arr.length - 1 && arr[i] === arr[i + 1] && !merged[i] && !merged[i + 1]) {
                    arr[i] *= 2;
                    this.score += arr[i];
                    arr[i + 1] = 0;
                    merged[i] = true;
                }
            }
            
            arr = arr.filter(val => val !== 0);
            
            while (arr.length < this.size) {
                arr.push(0);
            }
            
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== arr[col]) {
                    this.moved = true;
                }
                this.grid[row][col] = arr[col];
            }
        }
    }
    
    moveRight() {
        for (let row = 0; row < this.size; row++) {
            let arr = this.grid[row].filter(val => val !== 0);
            let merged = [];
            
            for (let i = arr.length - 1; i >= 0; i--) {
                if (i > 0 && arr[i] === arr[i - 1] && !merged[i] && !merged[i - 1]) {
                    arr[i] *= 2;
                    this.score += arr[i];
                    arr[i - 1] = 0;
                    merged[i] = true;
                }
            }
            
            arr = arr.filter(val => val !== 0);
            
            while (arr.length < this.size) {
                arr.unshift(0);
            }
            
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== arr[col]) {
                    this.moved = true;
                }
                this.grid[row][col] = arr[col];
            }
        }
    }
    
    moveUp() {
        for (let col = 0; col < this.size; col++) {
            let arr = [];
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] !== 0) {
                    arr.push(this.grid[row][col]);
                }
            }
            
            let merged = [];
            for (let i = 0; i < arr.length; i++) {
                if (i < arr.length - 1 && arr[i] === arr[i + 1] && !merged[i] && !merged[i + 1]) {
                    arr[i] *= 2;
                    this.score += arr[i];
                    arr[i + 1] = 0;
                    merged[i] = true;
                }
            }
            
            arr = arr.filter(val => val !== 0);
            
            while (arr.length < this.size) {
                arr.push(0);
            }
            
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] !== arr[row]) {
                    this.moved = true;
                }
                this.grid[row][col] = arr[row];
            }
        }
    }
    
    moveDown() {
        for (let col = 0; col < this.size; col++) {
            let arr = [];
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] !== 0) {
                    arr.push(this.grid[row][col]);
                }
            }
            
            let merged = [];
            for (let i = arr.length - 1; i >= 0; i--) {
                if (i > 0 && arr[i] === arr[i - 1] && !merged[i] && !merged[i - 1]) {
                    arr[i] *= 2;
                    this.score += arr[i];
                    arr[i - 1] = 0;
                    merged[i] = true;
                }
            }
            
            arr = arr.filter(val => val !== 0);
            
            while (arr.length < this.size) {
                arr.unshift(0);
            }
            
            for (let row = 0; row < this.size; row++) {
                if (this.grid[row][col] !== arr[row]) {
                    this.moved = true;
                }
                this.grid[row][col] = arr[row];
            }
        }
    }
    
    addRandomTile() {
        let emptyCells = [];
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    emptyCells.push({ row, col });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            let randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    updateDisplay() {
        this.tileContainer.innerHTML = '';
        
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] !== 0) {
                    this.createTile(this.grid[row][col], row, col);
                }
            }
        }
    }
    
    createTile(value, row, col) {
        let tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        
        let posX = col * 121.25;
        let posY = row * 121.25;
        
        tile.style.left = posX + 'px';
        tile.style.top = posY + 'px';
        
        this.tileContainer.appendChild(tile);
    }
    
    updateScore() {
        this.scoreContainer.textContent = this.score;
        this.bestScoreContainer.textContent = this.bestScore;
    }
    
    hasWon() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    isGameOver() {
        // Check for empty cells
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.grid[row][col] === 0) {
                    return false;
                }
            }
        }
        
        // Check for possible merges
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                let current = this.grid[row][col];
                
                if ((col < this.size - 1 && current === this.grid[row][col + 1]) ||
                    (row < this.size - 1 && current === this.grid[row + 1][col])) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    showMessage(message) {
        this.messageText.textContent = message;
        this.messageContainer.classList.remove('hidden');
    }
    
    hideMessage() {
        this.messageContainer.classList.add('hidden');
    }
    
    saveScore() {
        // Save to localStorage
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
            this.updateScore();
        }
        
        // Send to backend
        this.sendScoreToBackend();
    }
    
    async sendScoreToBackend() {
        try {
            const response = await fetch('http://localhost:3000/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    score: this.score,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('Score saved to backend successfully');
            }
        } catch (error) {
            console.log('Could not save score to backend:', error.message);
        }
    }
    
    copyGrid() {
        let newGrid = [];
        for (let row = 0; row < this.size; row++) {
            newGrid[row] = [...this.grid[row]];
        }
        return newGrid;
    }
    
    restart() {
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.hideMessage();
        this.setupGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
        this.updateScore();
    }
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
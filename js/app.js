/**
 * 2048 Puzzle Game - Main Application
 * Features: Swipe/Keyboard controls, Sound, LocalStorage, Analytics
 */

class Game2048 {
    constructor() {
        // Game state
        this.grid = null;
        this.size = 4;
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameOver = false;
        this.won = false;
        this.canMove = true;
        this.history = null;

        // DOM elements
        this.gridElement = document.getElementById('game-grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.gameOverModal = document.getElementById('game-over-modal');
        this.victoryModal = document.getElementById('victory-modal');

        // Buttons
        this.newGameBtn = document.getElementById('new-game-btn');
        this.undoBtn = document.getElementById('undo-btn');
        this.undoAdBtn = document.getElementById('undo-ad-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.continueBtn = document.getElementById('continue-btn');
        this.restartFromVictoryBtn = document.getElementById('restart-from-victory-btn');

        // Initialize
        this.init();
    }

    init() {
        // Create empty grid
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;

        // Add initial tiles
        this.addNewTile();
        this.addNewTile();

        // Update display
        this.updateDisplay();
        this.updateScore();

        // Setup event listeners
        this.setupEventListeners();

        // Register service worker
        this.registerServiceWorker();
    }

    setupEventListeners() {
        // Button clicks
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.undoAdBtn.addEventListener('click', () => this.undoWithAd());
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.continueBtn.addEventListener('click', () => this.closeVictoryModal());
        this.restartFromVictoryBtn.addEventListener('click', () => this.newGame());

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch/Swipe controls
        let touchStartX = 0;
        let touchStartY = 0;

        this.gridElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.gridElement.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;

            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 50) {
                    this.move('right');
                } else if (dx < -50) {
                    this.move('left');
                }
            } else {
                // Vertical swipe
                if (dy > 50) {
                    this.move('down');
                } else if (dy < -50) {
                    this.move('up');
                }
            }
        });

        // Language change listener
        window.addEventListener('languageChanged', () => {
            this.updateDisplay();
        });
    }

    handleKeyPress(e) {
        if (this.gameOver || !this.canMove) return;

        const key = e.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            e.preventDefault();
            const directions = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };
            this.move(directions[key]);
        }
    }

    move(direction) {
        if (this.gameOver || !this.canMove) return;

        // Save history for undo
        this.history = {
            grid: this.grid.map(row => [...row]),
            score: this.score
        };

        const moved = this.moveInDirection(direction);

        if (moved) {
            // Play sound
            this.playSound('slide');

            // Add new tile
            this.addNewTile();

            // Update display
            this.updateDisplay();
            this.updateScore();

            // Check game state
            this.checkGameState();

            // Track event
            this.trackEvent('move', { direction, score: this.score });
        }
    }

    moveInDirection(direction) {
        let moved = false;

        if (direction === 'up') {
            moved = this.moveUp();
        } else if (direction === 'down') {
            moved = this.moveDown();
        } else if (direction === 'left') {
            moved = this.moveLeft();
        } else if (direction === 'right') {
            moved = this.moveRight();
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i];
            const newRow = this.mergeLine(row);
            if (JSON.stringify(row) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].slice().reverse();
            const newRow = this.mergeLine(row).reverse();
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = this.grid.map((row) => row[j]);
            const newCol = this.mergeLine(col);
            if (JSON.stringify(col) !== JSON.stringify(newCol)) {
                moved = true;
            }
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = this.grid.map((row) => row[j]).reverse();
            const newCol = this.mergeLine(col).reverse();
            if (JSON.stringify(this.grid.map(row => row[j]).reverse()) !== JSON.stringify(newCol.reverse())) {
                moved = true;
            }
            for (let i = 0; i < this.size; i++) {
                this.grid[i][j] = newCol[this.size - 1 - i];
            }
        }
        return moved;
    }

    mergeLine(line) {
        // Remove zeros
        let result = line.filter(val => val !== 0);

        // Merge adjacent equal values
        for (let i = 0; i < result.length - 1; i++) {
            if (result[i] === result[i + 1]) {
                result[i] *= 2;
                this.score += result[i];
                result.splice(i + 1, 1);
                this.playSound('merge');
            }
        }

        // Fill with zeros
        while (result.length < this.size) {
            result.push(0);
        }

        return result;
    }

    addNewTile() {
        const emptyTiles = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyTiles.push({ i, j });
                }
            }
        }

        if (emptyTiles.length === 0) return;

        const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[randomTile.i][randomTile.j] = value;
    }

    checkGameState() {
        // Check for 2048
        if (!this.won) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.won = true;
                        this.showVictoryModal();
                        this.trackEvent('victory', { score: this.score });
                        return;
                    }
                }
            }
        }

        // Check for game over
        if (!this.canMoveAnywhere()) {
            this.gameOver = true;
            this.playSound('gameOver');
            this.showGameOverModal();
            this.trackEvent('gameOver', { score: this.score, best: this.bestScore });
        }
    }

    canMoveAnywhere() {
        // Check for empty tile
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) return true;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if ((i < this.size - 1 && this.grid[i + 1][j] === value) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === value)) {
                    return true;
                }
            }
        }

        return false;
    }

    updateDisplay() {
        // Clear grid
        this.gridElement.innerHTML = '';

        // Add tiles
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value > 0) {
                    const tile = document.createElement('div');
                    tile.className = 'tile new';
                    tile.setAttribute('data-value', value);
                    tile.textContent = value;
                    tile.style.gridColumn = j + 1;
                    tile.style.gridRow = i + 1;
                    this.gridElement.appendChild(tile);
                }
            }
        }
    }

    updateScore() {
        this.scoreElement.textContent = this.score;

        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore(this.bestScore);
        }
        this.bestScoreElement.textContent = this.bestScore;
    }

    showGameOverModal() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-best').textContent = this.bestScore;
        this.gameOverModal.classList.remove('hidden');
    }

    showVictoryModal() {
        document.getElementById('victory-score').textContent = this.score;
        this.victoryModal.classList.remove('hidden');
    }

    closeVictoryModal() {
        this.victoryModal.classList.add('hidden');
    }

    newGame() {
        this.gameOverModal.classList.add('hidden');
        this.victoryModal.classList.add('hidden');
        this.gameOver = false;
        this.won = false;
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.addNewTile();
        this.addNewTile();
        this.updateDisplay();
        this.updateScore();
        this.trackEvent('newGame', { bestScore: this.bestScore });
    }

    undo() {
        if (!this.history) {
            this.playSound('error');
            return;
        }

        this.grid = this.history.grid;
        this.score = this.history.score;
        this.history = null;
        this.updateDisplay();
        this.updateScore();
        this.playSound('undo');
        this.trackEvent('undo', { score: this.score });
    }

    undoWithAd() {
        // Show ad and then allow undo
        this.showInterstitialAd();

        // Simulate ad watching
        setTimeout(() => {
            this.undo();
        }, 5000);
    }

    showInterstitialAd() {
        const adContainer = document.getElementById('interstitial-ad');
        adContainer.classList.remove('hidden');

        // Hide ad after 5 seconds
        setTimeout(() => {
            adContainer.classList.add('hidden');
        }, 5000);

        this.trackEvent('adView', { adType: 'interstitial' });
    }

    playSound(type) {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        let frequency, duration;

        switch (type) {
            case 'slide':
                frequency = 800;
                duration = 0.1;
                break;
            case 'merge':
                frequency = 1200;
                duration = 0.15;
                break;
            case 'gameOver':
                frequency = 400;
                duration = 0.5;
                break;
            case 'undo':
                frequency = 600;
                duration = 0.2;
                break;
            case 'error':
                frequency = 300;
                duration = 0.3;
                break;
            default:
                return;
        }

        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio context error:', e);
        }
    }

    loadBestScore() {
        const saved = localStorage.getItem('puzzle2048_bestScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    saveBestScore(score) {
        localStorage.setItem('puzzle2048_bestScore', score.toString());
    }

    trackEvent(eventName, eventData = {}) {
        // GA4 tracking
        if (window.gtag) {
            gtag('event', `puzzle2048_${eventName}`, eventData);
        }

        // Debug log
        console.log(`Event: ${eventName}`, eventData);
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.warn('Service Worker registration failed:', err);
            });
        }
    }
}

// Initialize game when DOM is ready
let game;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        game = new Game2048();
    });
} else {
    game = new Game2048();
}

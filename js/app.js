/**
 * 2048 Puzzle Game - Main Application
 * Smooth slide animations, merge tracking, swipe/keyboard controls
 */

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
    });
}

class Game2048 {
    constructor() {
        this.size = 4;
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.moving = false;
        this.history = null;

        // Combo system
        this.combo = 0;
        this.comboTimer = null;

        // DOM elements
        this.gridElement = document.getElementById('game-grid');
        this.gridBg = document.querySelector('.grid-background');
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

        this.init();
    }

    init(freshGame = false) {
        this.grid = this.createEmptyGrid();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.keepPlaying = false;
        this.gridElement.innerHTML = '';

        if (!freshGame && this.loadGameState()) {
            // Restored from saved state
        } else {
            this.addRandomTile();
            this.addRandomTile();
        }
        this.render();
        this.updateScore();
        this.setupEventListeners();
        this.registerServiceWorker();
    }

    createEmptyGrid() {
        const grid = [];
        for (let r = 0; r < this.size; r++) {
            grid[r] = [];
            for (let c = 0; c < this.size; c++) {
                grid[r][c] = null;
            }
        }
        return grid;
    }

    createTile(value, row, col) {
        return {
            value: value,
            row: row,
            col: col,
            previousPosition: null,
            mergedFrom: null,
            savePosition() {
                this.previousPosition = { row: this.row, col: this.col };
            }
        };
    }

    // ========== TILE MANAGEMENT ==========

    addRandomTile() {
        const cells = this.getAvailableCells();
        if (cells.length === 0) return;

        const cell = cells[Math.floor(Math.random() * cells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        this.grid[cell.row][cell.col] = this.createTile(value, cell.row, cell.col);
    }

    getAvailableCells() {
        const cells = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (!this.grid[r][c]) cells.push({ row: r, col: c });
            }
        }
        return cells;
    }

    eachCell(callback) {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                callback(r, c, this.grid[r][c]);
            }
        }
    }

    prepareTiles() {
        this.eachCell((r, c, tile) => {
            if (tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    }

    // ========== MOVE LOGIC ==========

    move(direction) {
        if (this.gameOver || this.moving) return;

        // Save for undo
        this.saveHistory();

        // Prepare tiles (save positions, clear merge state)
        this.prepareTiles();

        const vector = this.getVector(direction);
        const traversals = this.buildTraversals(vector);
        let moved = false;
        let mergedThisMove = false;
        let maxMergeValue = 0;

        traversals.rows.forEach(row => {
            traversals.cols.forEach(col => {
                const tile = this.grid[row][col];
                if (!tile) return;

                const positions = this.findFarthestPosition({ row, col }, vector);
                const nextCell = positions.next;
                const next = nextCell ? this.grid[nextCell.row][nextCell.col] : null;

                if (next && next.value === tile.value && !next.mergedFrom) {
                    // MERGE
                    const merged = this.createTile(tile.value * 2, nextCell.row, nextCell.col);
                    merged.mergedFrom = [tile, next];

                    this.grid[row][col] = null;
                    this.grid[nextCell.row][nextCell.col] = merged;

                    // Update source tile's position (for slide animation to merge point)
                    tile.row = nextCell.row;
                    tile.col = nextCell.col;

                    this.score += merged.value;
                    if (typeof Haptic !== 'undefined') Haptic.light();
                    moved = true;
                    mergedThisMove = true;
                    if (merged.value > maxMergeValue) maxMergeValue = merged.value;

                    if (merged.value === 2048 && !this.won) {
                        this.won = true;
                        if (typeof Haptic !== 'undefined') Haptic.success();
                    }
                } else {
                    // MOVE to farthest available position
                    const farthest = positions.farthest;
                    if (farthest.row !== row || farthest.col !== col) {
                        this.grid[row][col] = null;
                        this.grid[farthest.row][farthest.col] = tile;
                        tile.row = farthest.row;
                        tile.col = farthest.col;
                        moved = true;
                    }
                }
            });
        });

        if (moved) {
            // Combo tracking
            if (mergedThisMove) {
                this.combo++;
                this.playSound(maxMergeValue >= 128 ? 'merge' : 'slide');
                if (maxMergeValue >= 256) this.triggerShake(maxMergeValue >= 1024 ? 6 : 3);
                this.showCombo();
            } else {
                this.combo = 0;
                this.playSound('slide');
                this.hideCombo();
            }

            this.addRandomTile();

            this.moving = true;
            this.render();

            setTimeout(() => {
                this.moving = false;
                this.updateScore();

                if (this.won && !this.keepPlaying) {
                    this.showVictoryModal();
                    this.trackEvent('victory', { score: this.score });
                } else if (!this.movesAvailable()) {
                    this.gameOver = true;
                    this.clearGameState();
                    this.playSound('gameOver');
                    if (typeof GameAds !== 'undefined') {
                        GameAds.showInterstitial({ onComplete: () => {
                            this.showGameOverModal();
                        } });
                    } else {
                        this.showGameOverModal();
                    }
                    this.trackEvent('gameOver', { score: this.score, best: this.bestScore });
                } else {
                    this.saveGameState();
                }
            }, 160);

            this.trackEvent('move', { direction, score: this.score });
        }
    }

    getVector(direction) {
        return {
            up:    { row: -1, col: 0 },
            right: { row: 0, col: 1 },
            down:  { row: 1, col: 0 },
            left:  { row: 0, col: -1 }
        }[direction];
    }

    buildTraversals(vector) {
        const rows = [], cols = [];
        for (let i = 0; i < this.size; i++) {
            rows.push(i);
            cols.push(i);
        }
        // Traverse from the farthest cell in the direction of movement
        if (vector.row === 1) rows.reverse();
        if (vector.col === 1) cols.reverse();
        return { rows, cols };
    }

    findFarthestPosition(cell, vector) {
        let previous;
        do {
            previous = { row: cell.row, col: cell.col };
            cell = { row: cell.row + vector.row, col: cell.col + vector.col };
        } while (this.withinBounds(cell) && !this.grid[cell.row][cell.col]);

        return {
            farthest: previous,
            next: this.withinBounds(cell) ? cell : null
        };
    }

    withinBounds(pos) {
        return pos.row >= 0 && pos.row < this.size &&
               pos.col >= 0 && pos.col < this.size;
    }

    movesAvailable() {
        return this.getAvailableCells().length > 0 || this.tileMatchesAvailable();
    }

    tileMatchesAvailable() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const tile = this.grid[r][c];
                if (!tile) continue;

                const directions = [{ row: 0, col: 1 }, { row: 1, col: 0 }];
                for (const d of directions) {
                    const nr = r + d.row, nc = c + d.col;
                    if (this.withinBounds({ row: nr, col: nc })) {
                        const other = this.grid[nr][nc];
                        if (other && other.value === tile.value) return true;
                    }
                }
            }
        }
        return false;
    }

    // ========== RENDERING ==========

    render() {
        const container = this.gridElement;
        container.innerHTML = '';

        const metrics = this.getCellMetrics();
        if (!metrics) return;

        this.eachCell((r, c, tile) => {
            if (!tile) return;

            // Render merged-from tiles (they slide toward the merge position)
            if (tile.mergedFrom) {
                tile.mergedFrom.forEach(source => {
                    const el = this.createTileEl(source.value, metrics);
                    const fromPos = source.previousPosition || { row: source.row, col: source.col };
                    this.setTilePos(el, fromPos.row, fromPos.col, metrics);
                    container.appendChild(el);

                    // Animate slide to merge position
                    requestAnimationFrame(() => {
                        this.setTilePos(el, tile.row, tile.col, metrics);
                    });

                    // Remove after slide animation completes
                    setTimeout(() => el.remove(), 160);
                });
            }

            // Render the tile itself
            const el = this.createTileEl(tile.value, metrics);

            if (tile.previousPosition) {
                // Tile moved - start at previous position, animate to current
                this.setTilePos(el, tile.previousPosition.row, tile.previousPosition.col, metrics);
                container.appendChild(el);
                requestAnimationFrame(() => {
                    this.setTilePos(el, tile.row, tile.col, metrics);
                });
            } else if (tile.mergedFrom) {
                // Merge result - appear at position with pop animation
                this.setTilePos(el, tile.row, tile.col, metrics);
                el.classList.add('tile-merged');
                container.appendChild(el);
            } else {
                // New tile - appear with scale animation
                this.setTilePos(el, tile.row, tile.col, metrics);
                el.classList.add('tile-new');
                container.appendChild(el);
            }
        });
    }

    createTileEl(value, metrics) {
        const el = document.createElement('div');
        el.className = 'tile';
        el.setAttribute('data-value', value);
        el.textContent = value;
        el.style.width = metrics.cellSize + 'px';
        el.style.height = metrics.cellSize + 'px';

        // Dynamic font size: scale with tile size
        const digits = String(value).length;
        let fontRatio = 0.45;
        if (digits === 3) fontRatio = 0.35;
        if (digits >= 4) fontRatio = 0.28;
        el.style.fontSize = Math.max(14, Math.floor(metrics.cellSize * fontRatio)) + 'px';

        return el;
    }

    setTilePos(el, row, col, metrics) {
        const pos = metrics.positions[row][col];
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';
    }

    getCellMetrics() {
        const cells = this.gridBg.querySelectorAll('.grid-cell');
        if (cells.length === 0) return null;

        const gridRect = this.gridElement.getBoundingClientRect();
        const positions = [];
        let cellSize = 0;

        for (let r = 0; r < this.size; r++) {
            positions[r] = [];
            for (let c = 0; c < this.size; c++) {
                const cell = cells[r * this.size + c];
                const cellRect = cell.getBoundingClientRect();
                positions[r][c] = {
                    x: cellRect.left - gridRect.left,
                    y: cellRect.top - gridRect.top
                };
                if (!cellSize) cellSize = cellRect.width;
            }
        }

        return { positions, cellSize };
    }

    // ========== UI ==========

    updateScore() {
        this.scoreElement.textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore(this.bestScore);
        }
        this.bestScoreElement.textContent = this.bestScore;
    }

    showGameOverModal() {
        if (typeof Haptic !== 'undefined') Haptic.heavy();
        if (typeof DailyStreak !== 'undefined') DailyStreak.report(this.score);
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
        this.keepPlaying = true;
    }

    newGame() {
        this.gameOverModal.classList.add('hidden');
        this.victoryModal.classList.add('hidden');
        this.clearGameState();
        this.init(true);
        this.trackEvent('newGame', { bestScore: this.bestScore });
    }

    // ========== UNDO ==========

    saveHistory() {
        this.history = {
            grid: this.grid.map(row => row.map(tile => tile ? tile.value : 0)),
            score: this.score
        };
    }

    undo() {
        if (!this.history) {
            this.playSound('error');
            return;
        }

        this.grid = this.createEmptyGrid();
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const val = this.history.grid[r][c];
                if (val > 0) {
                    this.grid[r][c] = this.createTile(val, r, c);
                }
            }
        }

        this.score = this.history.score;
        this.gameOver = false;
        this.history = null;
        this.render();
        this.updateScore();
        this.playSound('undo');
        this.trackEvent('undo', { score: this.score });
    }

    undoWithAd() {
        this.showInterstitialAd();
        setTimeout(() => this.undo(), 5000);
    }

    showInterstitialAd() {
        const adContainer = document.getElementById('interstitial-ad');
        adContainer.classList.remove('hidden');
        setTimeout(() => adContainer.classList.add('hidden'), 5000);
        this.trackEvent('adView', { adType: 'interstitial' });
    }

    // ========== EVENT LISTENERS ==========

    setupEventListeners() {
        if (this._eventsSetup) return;
        this._eventsSetup = true;

        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.undoBtn.addEventListener('click', () => this.undo());
        this.undoAdBtn.addEventListener('click', () => this.undoWithAd());
        this.restartBtn.addEventListener('click', () => this.newGame());
        this.continueBtn.addEventListener('click', () => this.closeVictoryModal());
        this.restartFromVictoryBtn.addEventListener('click', () => this.newGame());

        // Keyboard
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch/Swipe on grid background (visible element)
        let touchStartX = 0, touchStartY = 0;

        this.gridBg.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        this.gridBg.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absDx = Math.abs(dx), absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) < 30) return;

            if (absDx > absDy) {
                this.move(dx > 0 ? 'right' : 'left');
            } else {
                this.move(dy > 0 ? 'down' : 'up');
            }
        });

        // Recalculate positions on resize
        window.addEventListener('resize', () => {
            if (!this.moving) this.render();
        });

        window.addEventListener('languageChanged', () => {
            this.render();
        });
    }

    handleKeyPress(e) {
        // Global shortcuts (work even when game over)
        switch(e.key.toLowerCase()) {
            case 'r':
                e.preventDefault();
                this.newGame();
                return;
            case 'u':
                if (!this.gameOver) {
                    e.preventDefault();
                    this.undo();
                }
                return;
        }

        if (this.gameOver || this.moving) return;

        const map = {
            'ArrowUp': 'up', 'ArrowDown': 'down',
            'ArrowLeft': 'left', 'ArrowRight': 'right',
            'w': 'up', 's': 'down',
            'a': 'left', 'd': 'right'
        };

        const direction = map[e.key] || map[e.key.toLowerCase()];
        if (direction) {
            e.preventDefault();
            this.move(direction);
        }
    }

    // ========== SOUND ==========

    playSound(type) {
        const soundBtn = document.getElementById('sound-toggle');
        if (soundBtn && soundBtn.textContent === '🔇') return;

        const sounds = {
            slide: { freq: 800, dur: 0.1 },
            merge: { freq: 1200, dur: 0.15 },
            gameOver: { freq: 400, dur: 0.5 },
            undo: { freq: 600, dur: 0.2 },
            error: { freq: 300, dur: 0.3 }
        };

        const s = sounds[type];
        if (!s) return;

        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = s.freq;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + s.dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + s.dur);
        } catch (e) {
            // Audio not supported
        }
    }

    // ========== EFFECTS ==========

    triggerShake(intensity = 3) {
        const grid = this.gridBg;
        if (!grid) return;
        let frame = 0;
        const maxFrames = 8;
        const shake = () => {
            if (frame >= maxFrames) {
                grid.style.transform = '';
                return;
            }
            const x = (Math.random() - 0.5) * intensity;
            const y = (Math.random() - 0.5) * intensity;
            grid.style.transform = `translate(${x}px, ${y}px)`;
            frame++;
            requestAnimationFrame(shake);
        };
        shake();
    }

    showCombo() {
        if (this.combo < 2) return;
        let el = document.getElementById('combo-display');
        if (!el) {
            el = document.createElement('div');
            el.id = 'combo-display';
            el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);font-size:48px;font-weight:800;color:var(--accent,#f39c12);text-shadow:0 0 20px rgba(243,156,18,0.5);pointer-events:none;z-index:100;transition:transform 0.2s cubic-bezier(0.4,0,0.2,1),opacity 0.3s;opacity:0;';
            document.body.appendChild(el);
        }
        el.textContent = `${this.combo}x COMBO`;
        el.style.transform = 'translate(-50%,-50%) scale(1)';
        el.style.opacity = '1';
        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            el.style.transform = 'translate(-50%,-50%) scale(0.8)';
            el.style.opacity = '0';
        }, 800);
    }

    hideCombo() {
        const el = document.getElementById('combo-display');
        if (el) {
            el.style.transform = 'translate(-50%,-50%) scale(0)';
            el.style.opacity = '0';
        }
    }

    // ========== STORAGE ==========

    loadBestScore() {
        return parseInt(localStorage.getItem('puzzle2048_bestScore') || '0', 10);
    }

    saveBestScore(score) {
        localStorage.setItem('puzzle2048_bestScore', score.toString());
    }

    saveGameState() {
        const state = {
            grid: this.grid.map(row => row.map(tile => tile ? tile.value : 0)),
            score: this.score,
            gameOver: this.gameOver
        };
        localStorage.setItem('puzzle2048_gameState', JSON.stringify(state));
    }

    loadGameState() {
        try {
            const raw = localStorage.getItem('puzzle2048_gameState');
            if (!raw) return false;

            const state = JSON.parse(raw);
            if (!state.grid || state.grid.length !== this.size) return false;

            for (let r = 0; r < this.size; r++) {
                for (let c = 0; c < this.size; c++) {
                    const val = state.grid[r][c];
                    if (val > 0) {
                        this.grid[r][c] = this.createTile(val, r, c);
                    }
                }
            }
            this.score = state.score || 0;
            this.gameOver = state.gameOver || false;
            return true;
        } catch (e) {
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem('puzzle2048_gameState');
    }

    // ========== ANALYTICS ==========

    trackEvent(name, data = {}) {
        if (window.gtag) {
            gtag('event', `puzzle2048_${name}`, data);
        }
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        }
    }
}

// Initialize game when DOM is ready
let game;

function startGame() {
    try {
        game = new Game2048();
        initSoundToggle();
    } catch(e) {
        console.error('Init error:', e);
    } finally {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 300);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    startGame();
}

if (typeof DailyStreak !== 'undefined') {
    DailyStreak.init({ gameId: 'puzzle-2048', bestScoreKey: 'puzzle2048_bestScore', minTarget: 500, unit: 'pts' });
}

if (typeof GameAds !== 'undefined') GameAds.init();

function initSoundToggle() {
    const btn = document.getElementById('sound-toggle');
    if (!btn) return;

    let soundEnabled = localStorage.getItem('puzzle2048_sound') !== 'false';
    btn.textContent = soundEnabled ? '🔊' : '🔇';

    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        btn.textContent = soundEnabled ? '🔊' : '🔇';
        localStorage.setItem('puzzle2048_sound', soundEnabled.toString());
    });
}

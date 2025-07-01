// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetris pieces
const PIECES = [
    // I piece
    [
        [1, 1, 1, 1]
    ],
    // O piece
    [
        [1, 1],
        [1, 1]
    ],
    // T piece
    [
        [0, 1, 0],
        [1, 1, 1]
    ],
    // S piece
    [
        [0, 1, 1],
        [1, 1, 0]
    ],
    // Z piece
    [
        [1, 1, 0],
        [0, 1, 1]
    ],
    // J piece
    [
        [1, 0, 0],
        [1, 1, 1]
    ],
    // L piece
    [
        [0, 0, 1],
        [1, 1, 1]
    ]
];

const COLORS = [
    '#00f5ff', // I - cyan
    '#ffff00', // O - yellow
    '#a000ff', // T - purple
    '#00ff00', // S - green
    '#ff0000', // Z - red
    '#0000ff', // J - blue
    '#ff8000'  // L - orange
];

// Game state
let board = [];
let currentPiece = null;
let currentX = 0;
let currentY = 0;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let isPaused = false;
let dropTime = 0;
let lastTime = 0;

// Audio system for GameBoy-style sounds
class GameAudio {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
        this.init();
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.log('Audio not supported');
            this.enabled = false;
        }
    }

    createSounds() {
        // GameBoy-style sound frequencies
        this.sounds = {
            move: { freq: 220, duration: 0.1, type: 'square' },
            rotate: { freq: 330, duration: 0.15, type: 'square' },
            drop: { freq: 110, duration: 0.2, type: 'square' },
            lineClear: { freq: 440, duration: 0.5, type: 'sawtooth' },
            gameOver: { freq: 165, duration: 1.0, type: 'triangle' },
            levelUp: { freq: 523, duration: 0.8, type: 'sine' }
        };
    }

    playSound(soundName) {
        if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;

        try {
            const sound = this.sounds[soundName];
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = sound.type;
            oscillator.frequency.setValueAtTime(sound.freq, this.audioContext.currentTime);

            // GameBoy-style envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + sound.duration);
        } catch (e) {
            console.log('Error playing sound:', e);
        }
    }

    // Toggle mute/unmute
    toggleMute() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Get current mute status
    isMuted() {
        return !this.enabled;
    }

    // Resume audio context on user interaction (required by browsers)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Initialize audio system
const gameAudio = new GameAudio();

// Canvas elements with performance optimizations
const canvas = document.getElementById('gameCanvas');
const canvasDesktop = document.getElementById('gameCanvasDesktop');
const ctx = canvas.getContext('2d', {
    alpha: false, // Disable alpha channel for better performance
    desynchronized: true // Allow desynchronized rendering
});
const ctxDesktop = canvasDesktop ? canvasDesktop.getContext('2d', {
    alpha: false,
    desynchronized: true
}) : null;

const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d', { alpha: false });
const nextCanvasDesktop = document.getElementById('nextCanvasDesktop');
const nextCtxDesktop = nextCanvasDesktop ? nextCanvasDesktop.getContext('2d', { alpha: false }) : null;

// UI elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverElement = document.getElementById('gameOver');
const gameOverElementDesktop = document.getElementById('gameOverDesktop');
const finalScoreElement = document.getElementById('finalScore');
const finalScoreElementDesktop = document.getElementById('finalScoreDesktop');

// Initialize game
function init() {
    // Create empty board
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    
    // Reset game state
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = true;
    isPaused = false;
    dropTime = 0;
    lastTime = 0;
    
    // Update UI
    updateScore();
    if (gameOverElement) gameOverElement.classList.add('hidden');
    if (gameOverElementDesktop) gameOverElementDesktop.classList.add('hidden');
    
    // Generate first pieces
    nextPiece = getRandomPiece();
    spawnPiece();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function getRandomPiece() {
    const index = Math.floor(Math.random() * PIECES.length);
    return {
        shape: PIECES[index],
        color: COLORS[index],
        type: index
    };
}

function spawnPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    currentX = Math.floor(BOARD_WIDTH / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    
    // Check game over
    if (collision(currentPiece.shape, currentX, currentY)) {
        gameOver();
        return;
    }
    
    drawNextPiece();
}

function collision(piece, x, y) {
    for (let py = 0; py < piece.length; py++) {
        for (let px = 0; px < piece[py].length; px++) {
            if (piece[py][px] !== 0) {
                const newX = x + px;
                const newY = y + py;
                
                if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
                    return true;
                }
                
                if (newY >= 0 && board[newY][newX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function placePiece() {
    for (let py = 0; py < currentPiece.shape.length; py++) {
        for (let px = 0; px < currentPiece.shape[py].length; px++) {
            if (currentPiece.shape[py][px] !== 0) {
                const boardY = currentY + py;
                const boardX = currentX + px;
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.type + 1;
                }
            }
        }
    }
    
    clearLines();
    spawnPiece();
}

function clearLines() {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;

        // Scoring system
        const lineScores = [0, 100, 300, 500, 800];
        score += lineScores[linesCleared] * level;

        // Level progression
        const newLevel = Math.floor(lines / 10) + 1;
        const leveledUp = newLevel > level;
        if (leveledUp) {
            level = newLevel;
            gameAudio.playSound('levelUp');
        }

        // Play line clear sound
        gameAudio.playSound('lineClear');

        updateScore();
    }
}

function rotatePiece(piece) {
    const rotated = [];
    const rows = piece.length;
    const cols = piece[0].length;
    
    for (let i = 0; i < cols; i++) {
        rotated[i] = [];
        for (let j = 0; j < rows; j++) {
            rotated[i][j] = piece[rows - 1 - j][i];
        }
    }
    
    return rotated;
}

function move(dx, dy) {
    if (!gameRunning || isPaused) {
        return false;
    }

    if (!currentPiece) {
        return false;
    }

    const newX = currentX + dx;
    const newY = currentY + dy;

    if (!collision(currentPiece.shape, newX, newY)) {
        currentX = newX;
        currentY = newY;

        // Play move sound for horizontal movement
        if (dx !== 0) {
            gameAudio.playSound('move');
        }

        return true;
    }

    if (dy > 0) {
        placePiece();
    }

    return false;
}

function rotate() {
    if (!gameRunning || isPaused) {
        return;
    }

    if (!currentPiece) {
        return;
    }

    const rotated = rotatePiece(currentPiece.shape);

    if (!collision(rotated, currentX, currentY)) {
        currentPiece.shape = rotated;
        gameAudio.playSound('rotate');
    }
}

function hardDrop() {
    if (!gameRunning || isPaused) return;

    let dropCount = 0;
    while (move(0, 1)) {
        score += 2;
        dropCount++;
    }

    if (dropCount > 0) {
        gameAudio.playSound('drop');
    }

    updateScore();
}

// Optimized draw function with reduced canvas operations
function draw() {
    // Draw on both mobile and desktop canvas
    drawOnCanvas(ctx, canvas, true); // Mobile canvas
    if (ctxDesktop && canvasDesktop) {
        drawOnCanvas(ctxDesktop, canvasDesktop, false); // Desktop canvas
    }
}

function drawOnCanvas(context, canvasElement, isMobile) {
    // Clear canvas once
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvasElement.width, canvasElement.height);

    // Batch drawing operations to reduce context switches
    context.lineWidth = 1;

    // Draw board blocks in batches by color
    const colorBatches = {};
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x] !== 0) {
                const colorIndex = board[y][x] - 1;
                if (!colorBatches[colorIndex]) {
                    colorBatches[colorIndex] = [];
                }
                colorBatches[colorIndex].push({x: x * BLOCK_SIZE, y: y * BLOCK_SIZE});
            }
        }
    }

    // Draw batched board blocks
    for (const colorIndex in colorBatches) {
        context.fillStyle = COLORS[colorIndex];
        for (const block of colorBatches[colorIndex]) {
            context.fillRect(block.x, block.y, BLOCK_SIZE, BLOCK_SIZE);
        }
    }

    // Draw current piece
    if (currentPiece) {
        context.fillStyle = currentPiece.color;
        for (let py = 0; py < currentPiece.shape.length; py++) {
            for (let px = 0; px < currentPiece.shape[py].length; px++) {
                if (currentPiece.shape[py][px] !== 0) {
                    const x = (currentX + px) * BLOCK_SIZE;
                    const y = (currentY + py) * BLOCK_SIZE;
                    context.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    // Draw grid lines (only on desktop or when not mobile)
    if (!isMobile || window.innerWidth > 768) {
        context.strokeStyle = '#333';
        context.beginPath();

        // Vertical lines
        for (let x = 0; x <= BOARD_WIDTH; x++) {
            context.moveTo(x * BLOCK_SIZE, 0);
            context.lineTo(x * BLOCK_SIZE, canvasElement.height);
        }

        // Horizontal lines
        for (let y = 0; y <= BOARD_HEIGHT; y++) {
            context.moveTo(0, y * BLOCK_SIZE);
            context.lineTo(canvasElement.width, y * BLOCK_SIZE);
        }

        context.stroke();
    }
}

function drawNextPiece() {
    // Draw on both canvases (mobile and desktop)
    drawNextPieceOnCanvas(nextCtx, nextCanvas);
    drawNextPieceOnCanvas(nextCtxDesktop, nextCanvasDesktop);
}

function drawNextPieceOnCanvas(ctx, canvas) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (nextPiece) {
        const blockSize = 20;
        const offsetX = (canvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (canvas.height - nextPiece.shape.length * blockSize) / 2;

        ctx.fillStyle = nextPiece.color;
        for (let py = 0; py < nextPiece.shape.length; py++) {
            for (let px = 0; px < nextPiece.shape[py].length; px++) {
                if (nextPiece.shape[py][px] !== 0) {
                    const x = offsetX + px * blockSize;
                    const y = offsetY + py * blockSize;
                    ctx.fillRect(x, y, blockSize, blockSize);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }
    }
}

// Optimized score update with batching to reduce DOM manipulation
let scoreUpdatePending = false;
function updateScore() {
    if (scoreUpdatePending) return;

    scoreUpdatePending = true;
    requestAnimationFrame(() => {
        scoreElement.textContent = score;
        levelElement.textContent = level;
        linesElement.textContent = lines;
        scoreUpdatePending = false;
    });
}

function gameOver() {
    gameRunning = false;
    gameAudio.playSound('gameOver');

    // Update both mobile and desktop game over screens
    if (finalScoreElement) finalScoreElement.textContent = score;
    if (finalScoreElementDesktop) finalScoreElementDesktop.textContent = score;

    if (gameOverElement) gameOverElement.classList.remove('hidden');
    if (gameOverElementDesktop) gameOverElementDesktop.classList.remove('hidden');
}

// Frame rate limiting for better performance
let lastFrameTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function gameLoop(time) {
    if (!gameRunning) return;

    // Frame rate limiting
    if (time - lastFrameTime < frameInterval) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;
    lastFrameTime = time;

    if (!isPaused) {
        dropTime += deltaTime;
        const dropInterval = Math.max(50, 1000 - (level - 1) * 100);

        if (dropTime > dropInterval) {
            move(0, 1);
            dropTime = 0;
        }
    }

    draw();
    requestAnimationFrame(gameLoop);
}

function togglePause() {
    isPaused = !isPaused;
    const pauseText = isPaused ? 'Resume' : 'Pause';

    // Update both mobile and desktop pause buttons
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseBtnDesktop = document.getElementById('pauseBtnDesktop');

    if (pauseBtn) pauseBtn.textContent = pauseText;
    if (pauseBtnDesktop) pauseBtnDesktop.textContent = pauseText;
}

function toggleMute() {
    const isEnabled = gameAudio.toggleMute();
    const muteText = isEnabled ? '🔊' : '🔇';
    const muteTextDesktop = isEnabled ? '🔊 Sound' : '🔇 Muted';

    // Update both mobile and desktop mute buttons
    const muteBtn = document.getElementById('muteBtn');
    const muteBtnDesktop = document.getElementById('muteBtnDesktop');

    if (muteBtn) muteBtn.textContent = muteText;
    if (muteBtnDesktop) muteBtnDesktop.textContent = muteTextDesktop;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    // Resume audio context on first keyboard interaction
    gameAudio.resume();

    switch(e.code) {
        case 'ArrowLeft':
        case 'KeyA':
            e.preventDefault();
            move(-1, 0);
            break;
        case 'ArrowRight':
        case 'KeyD':
            e.preventDefault();
            move(1, 0);
            break;
        case 'ArrowDown':
        case 'KeyS':
            e.preventDefault();
            if (move(0, 1)) {
                score += 1;
                updateScore();
            }
            break;
        case 'ArrowUp':
        case 'KeyW':
            e.preventDefault();
            rotate();
            break;
        case 'Space':
            e.preventDefault();
            hardDrop();
            break;
    }
});

// Desktop button event listeners only
document.getElementById('resetBtnDesktop').addEventListener('click', init);
document.getElementById('restartBtn').addEventListener('click', init);
document.getElementById('restartBtnDesktop').addEventListener('click', init);
document.getElementById('pauseBtnDesktop').addEventListener('click', togglePause);
document.getElementById('muteBtnDesktop').addEventListener('click', toggleMute);

// Mobile controls with optimized touch handling
function setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const dropBtn = document.getElementById('dropBtn');

    // Throttling function to prevent excessive calls
    function throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();

            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }

    // Optimized helper function with single event listener
    function addOptimizedTouchEvent(element, callback) {
        if (!element) return;

        // Throttle the callback to prevent excessive calls
        const throttledCallback = throttle(callback, 100); // 100ms throttle

        // Add haptic feedback (throttled)
        const triggerHapticFeedback = throttle(() => {
            if (navigator.vibrate) {
                navigator.vibrate(30); // Reduced vibration time
            }
        }, 200); // Throttle haptic feedback more aggressively

        // Optimized visual feedback using CSS classes
        function addVisualFeedback() {
            element.classList.add('active-press');
            setTimeout(() => {
                element.classList.remove('active-press');
            }, 100); // Reduced timeout
        }

        // Use single touchstart event for mobile, fallback to click
        const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

        if (isMobile) {
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                gameAudio.resume(); // Resume audio context on user interaction
                addVisualFeedback();
                triggerHapticFeedback();
                throttledCallback();
            }, { passive: false });
        } else {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                gameAudio.resume(); // Resume audio context on user interaction
                addVisualFeedback();
                throttledCallback();
            });
        }

        // Prevent context menu on long press
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }

    // Setup each button with optimized events
    addOptimizedTouchEvent(leftBtn, () => move(-1, 0));
    addOptimizedTouchEvent(rightBtn, () => move(1, 0));
    addOptimizedTouchEvent(downBtn, () => {
        if (move(0, 1)) {
            score += 1;
            updateScore();
        }
    });
    addOptimizedTouchEvent(rotateBtn, () => rotate());
    addOptimizedTouchEvent(dropBtn, () => hardDrop());

    // Also setup reset, pause, and mute buttons for mobile
    const resetBtn = document.getElementById('resetBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const muteBtn = document.getElementById('muteBtn');

    if (resetBtn) {
        addOptimizedTouchEvent(resetBtn, () => init());
    }
    if (pauseBtn) {
        addOptimizedTouchEvent(pauseBtn, () => togglePause());
    }
    if (muteBtn) {
        addOptimizedTouchEvent(muteBtn, () => toggleMute());
    }
}

// Update copyright year
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = currentYear;
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    updateCopyrightYear();
    setupMobileControls();
    init();
});

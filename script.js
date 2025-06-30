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

// Canvas elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');
const nextCanvasDesktop = document.getElementById('nextCanvasDesktop');
const nextCtxDesktop = nextCanvasDesktop.getContext('2d');

// UI elements
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverElement = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');

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
    gameOverElement.classList.add('hidden');
    
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
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 10) + 1;
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
    if (!gameRunning || isPaused) return;
    
    const newX = currentX + dx;
    const newY = currentY + dy;
    
    if (!collision(currentPiece.shape, newX, newY)) {
        currentX = newX;
        currentY = newY;
        return true;
    }
    
    if (dy > 0) {
        placePiece();
    }
    
    return false;
}

function rotate() {
    if (!gameRunning || isPaused) return;
    
    const rotated = rotatePiece(currentPiece.shape);
    
    if (!collision(rotated, currentX, currentY)) {
        currentPiece.shape = rotated;
    }
}

function hardDrop() {
    if (!gameRunning || isPaused) return;
    
    while (move(0, 1)) {
        score += 2;
    }
    updateScore();
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x] !== 0) {
                ctx.fillStyle = COLORS[board[y][x] - 1];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                ctx.strokeStyle = '#333';
                ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        ctx.fillStyle = currentPiece.color;
        for (let py = 0; py < currentPiece.shape.length; py++) {
            for (let px = 0; px < currentPiece.shape[py].length; px++) {
                if (currentPiece.shape[py][px] !== 0) {
                    const x = (currentX + px) * BLOCK_SIZE;
                    const y = (currentY + py) * BLOCK_SIZE;
                    ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                    ctx.strokeStyle = '#333';
                    ctx.strokeRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
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

function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

function gameOver() {
    gameRunning = false;
    finalScoreElement.textContent = score;
    gameOverElement.classList.remove('hidden');
}

function gameLoop(time) {
    if (!gameRunning) return;

    const deltaTime = time - lastTime;
    lastTime = time;

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

// Event listeners
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

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

// Button event listeners
document.getElementById('resetBtn').addEventListener('click', init);
document.getElementById('resetBtnDesktop').addEventListener('click', init);
document.getElementById('restartBtn').addEventListener('click', init);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('pauseBtnDesktop').addEventListener('click', togglePause);

// Mobile controls with error handling
function setupMobileControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const downBtn = document.getElementById('downBtn');
    const rotateBtn = document.getElementById('rotateBtn');
    const dropBtn = document.getElementById('dropBtn');

    if (leftBtn) {
        leftBtn.addEventListener('click', (e) => {
            e.preventDefault();
            move(-1, 0);
        });
        leftBtn.addEventListener('touchstart', (e) => e.preventDefault());
    }

    if (rightBtn) {
        rightBtn.addEventListener('click', (e) => {
            e.preventDefault();
            move(1, 0);
        });
        rightBtn.addEventListener('touchstart', (e) => e.preventDefault());
    }

    if (downBtn) {
        downBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (move(0, 1)) {
                score += 1;
                updateScore();
            }
        });
        downBtn.addEventListener('touchstart', (e) => e.preventDefault());
    }

    if (rotateBtn) {
        rotateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            rotate();
        });
        rotateBtn.addEventListener('touchstart', (e) => e.preventDefault());
    }

    if (dropBtn) {
        dropBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hardDrop();
        });
        dropBtn.addEventListener('touchstart', (e) => e.preventDefault());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    setupMobileControls();
    init();
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI Elements
const scoreText = document.getElementById("score-text");
const waveText = document.getElementById("wave-text");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const okayBtn = document.getElementById("okay-btn");
const menuOverlay = document.getElementById("menu-overlay");
const overlayTitle = document.getElementById("overlay-title");

// Game State Variables
let score = 0;
let wave = 1;
let isPaused = false;
let isGameOver = false;
let animationFrameId = null;

// Paddle Configuration
const paddleHeight = 10;
const paddleWidth = 70;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Ball Configuration
const ballRadius = 6;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 3;
let dy = -3;
const baseSpeed = 3.5;

// Brick Grid Configuration (Optimized to layout scaling perfectly inside 370px width boundary limits)
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 60;
const brickHeight = 16;
const brickPadding = 8;
const brickOffsetTop = 25;
const brickOffsetLeft = 20;
let bricks = [];

// Matrix Theme Palette
const brickColors = ["#39ff14", "#10b981", "#059669"];

// Initialize/Generate Bricks for Infinite Loop
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

// Keyboard Event Listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === " " || e.key === "p" || e.key === "P") togglePause();
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Brick Collision Detector
function collisionDetection() {
    let activeBricks = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                activeBricks++;
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score += 10;
                    scoreText.innerText = score;
                }
            }
        }
    }

    // INFINITE LOOP ENGINE
    if (activeBricks === 0) {
        wave++;
        waveText.innerText = wave;
        initBricks();
        resetBallAndPaddle();
        dx = dx > 0 ? baseSpeed + (wave * 0.4) : -(baseSpeed + (wave * 0.4));
        dy = dy > 0 ? baseSpeed + (wave * 0.4) : -(baseSpeed + (wave * 0.4));
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2;
    y = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
}

// Drawing Functions using Matrix Theme Assets
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#39ff14"; // Neon Green Ball
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#10b981"; // Theme Emerald Paddle
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColors[r] || "#10b981";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// Core Game Loop
function draw() {
    if (isPaused || isGameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } 
    else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        } else {
            triggerGameOver();
            return;
        }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 6;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 6;
    }

    x += dx;
    y += dy;

    animationFrameId = requestAnimationFrame(draw);
}

// Pause Menu Controls
function togglePause() {
    if (isGameOver) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        cancelAnimationFrame(animationFrameId);
        overlayTitle.innerText = "GAME PAUSED";
        menuOverlay.style.display = "flex";
    } else {
        menuOverlay.style.display = "none";
        draw();
    }
}

function triggerGameOver() {
    isGameOver = true;
    cancelAnimationFrame(animationFrameId);
    overlayTitle.innerText = "GAME OVER";
    okayBtn.innerText = "PLAY AGAIN";
    menuOverlay.style.display = "flex";
}

function restartGame() {
    score = 0;
    wave = 1;
    dx = baseSpeed;
    dy = -baseSpeed;
    isPaused = false;
    isGameOver = false;
    scoreText.innerText = score;
    waveText.innerText = wave;
    okayBtn.innerText = "OKAY / RESUME";
    menuOverlay.style.display = "none";
    initBricks();
    resetBallAndPaddle();
    cancelAnimationFrame(animationFrameId);
    draw();
}

// Button Event Listeners
pauseBtn.addEventListener("click", togglePause);
okayBtn.addEventListener("click", () => {
    if (isGameOver) {
        restartGame();
    } else {
        togglePause();
    }
});
resetBtn.addEventListener("click", restartGame);

// Start Game Initialization
initBricks();
draw();

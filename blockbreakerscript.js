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
let isGameStarted = false; // Game start check system
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

// Brick Grid Configuration
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 60;
const brickHeight = 16;
const brickPadding = 8;
const brickOffsetTop = 25;
const brickOffsetLeft = 20;
let bricks = [];

const brickColors = ["#39ff14", "#10b981", "#059669"];

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
// MOUSE MOVEMENT LISTENER (Bouncer control karne ke liye)
document.addEventListener("mousemove", mouseMoveHandler, false);
// TOUCH DEVICE LISTENER (Mobile par smooth control ke liye)
canvas.addEventListener("touchmove", touchMoveHandler, { passive: false });

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === " " || e.key === "p" || e.key === "P") handleStartPauseLogic();
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

// Mouse movement core control calculator
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

// Touch swipe calculation platform
function touchMoveHandler(e) {
    e.preventDefault(); // Screen scroll hone se rokne ke liye
    const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

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

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#39ff14";
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#10b981";
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

// Welcome Screen Text Renderer
function drawWelcomeScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawPaddle();
    drawBall();
    
    // Welcome text styling matrix neon overlay
    ctx.fillStyle = "rgba(2, 12, 4, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, Arial";
    ctx.fillStyle = "#39ff14";
    ctx.textAlign = "center";
    ctx.fillText("CLICK START TO PLAY", canvas.width / 2, canvas.height / 2 + 5);
}

// Core Engine Loop
function draw() {
    if (!isGameStarted) {
        drawWelcomeScreen();
        return;
    }

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

// Start & Pause Trigger controller combined engine
function handleStartPauseLogic() {
    if (isGameOver) return;

    if (!isGameStarted) {
        // Shuru me START dabane par game chalu hoga
        isGameStarted = true;
        pauseBtn.innerText = "PAUSE";
        draw();
    } else {
        // Baad me dabane par PAUSE/RESUME hoga
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
    isGameStarted = false; // Reset to welcome state
    isPaused = false;
    isGameOver = false;
    scoreText.innerText = score;
    waveText.innerText = wave;
    pauseBtn.innerText = "START";
    menuOverlay.style.display = "none";
    initBricks();
    resetBallAndPaddle();
    cancelAnimationFrame(animationFrameId);
    draw();
}

// Button Events
pauseBtn.addEventListener("click", handleStartPauseLogic);
okayBtn.addEventListener("click", () => {
    if (isGameOver) {
        restartGame();
    } else {
        handleStartPauseLogic(); // Acts as Okay/Resume close trigger
    }
});
resetBtn.addEventListener("click", restartGame);

// Initial setup rendering system
initBricks();
draw();

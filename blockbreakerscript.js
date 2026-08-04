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

// Game State Engine Variables
let score = 0;
let wave = 1;
let isGameStarted = false; 
let isPaused = false;
let isGameOver = false;

// Refresh Rate Engine Parameters (Delta Time Tracking)
let lastTime = 0;

// Paddle Configuration
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// Ball Configuration (SAFE CONTROLLED BASE SPEED)
const ballRadius = 6;
let x = canvas.width / 2;
let y = canvas.height - 30;

// Base speed ko 120 pixels per second par set kiya hai (Bohot calm chalega)
const baseSpeed = 120; 
let dx = baseSpeed;
let dy = -baseSpeed;

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

// Global Event Listeners
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches.clientX - rect.left;
    if (touchX > 0 && touchX < canvas.width) {
        paddleX = touchX - paddleWidth / 2;
    }
}, { passive: false });

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === " " || e.key === "p" || e.key === "P") handleStartPauseLogic();
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
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
        
        // Next waves me sirf halki si safe scaling speed increments (15px per wave increase)
        const currentSpeed = baseSpeed + (wave * 15);
        dx = dx > 0 ? currentSpeed : -currentSpeed;
        dy = dy > 0 ? currentSpeed : -currentSpeed;
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

function handleStartPauseLogic() {
    if (isGameOver) return;

    if (!isGameStarted) {
        isGameStarted = true;
        pauseBtn.innerText = "PAUSE";
    } else {
        isPaused = !isPaused;
        if (isPaused) {
            overlayTitle.innerText = "GAME PAUSED";
            menuOverlay.style.display = "flex";
        } else {
            menuOverlay.style.display = "none";
        }
    }
}

function triggerGameOver() {
    isGameOver = true;
    overlayTitle.innerText = "GAME OVER";
    okayBtn.innerText = "PLAY AGAIN";
    menuOverlay.style.display = "flex";
}

function restartGame() {
    score = 0;
    wave = 1;
    dx = baseSpeed;
    dy = -baseSpeed;
    isGameStarted = false; 
    isPaused = false;
    isGameOver = false;
    scoreText.innerText = score;
    waveText.innerText = wave;
    pauseBtn.innerText = "START";
    menuOverlay.style.display = "none";
    initBricks();
    resetBallAndPaddle();
}

pauseBtn.addEventListener("click", handleStartPauseLogic);
okayBtn.addEventListener("click", () => {
    if (isGameOver) {
        restartGame();
    } else {
        handleStartPauseLogic();
    }
});
resetBtn.addEventListener("click", restartGame);

// Time Dependent Framework Loop Engine
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    
    // Seconds format breakdown calculations
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Delta compression caps to prevent breaks during heavy background frame lag
    if (dt > 0.1) dt = 0.1; 

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBricks();
    drawPaddle();
    drawBall();

    if (!isGameStarted) {
        ctx.fillStyle = "rgba(2, 12, 4, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#39ff14";
        ctx.textAlign = "center";
        ctx.fillText("CLICK THE START BUTTON TO PLAY", canvas.width / 2, canvas.height / 2);
    } 
    else if (!isPaused && !isGameOver) {
        collisionDetection();

        if (x + (dx * dt) > canvas.width - ballRadius || x + (dx * dt) < ballRadius) {
            dx = -dx;
        }
        if (y + (dy * dt) < ballRadius) {
            dy = -dy;
        } 
        else if (y + (dy * dt) > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                triggerGameOver();
            }
        }

        // Keyboard tracking fallback calculation engine
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 300 * dt; // 300px per second frame locked speed
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 300 * dt;
        }

        // Ball movement calculation locked tightly to actual real-time spent 
        x += dx * dt;
        y += dy * dt;
    }

    requestAnimationFrame(gameLoop);
}

initBricks();
// First framework timestamp initialization anchor trigger
requestAnimationFrame((timestamp) => {
    lastTime = timestamp;
    gameLoop(timestamp);
});

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
let isGameStarted = false; // Isko use karke loop ko roka jata hai
let isPaused = false;
let isGameOver = false;
let animationFrameId = null;

// Paddle Configuration
const paddleHeight = 10;
const paddleWidth = 75;
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

// Global Event Listeners - Dynamic tracking method updates
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

// Touch tracking logic for mobile
canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
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

// Bouncer super-responsive calculations engine
function mouseMoveHandler(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    // Agar cursor canvas bound ke andar hai tabhi update karein
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

// Dynamic State Logic Controller
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

// Click Listeners Binding
pauseBtn.addEventListener("click", handleStartPauseLogic);
okayBtn.addEventListener("click", () => {
    if (isGameOver) {
        restartGame();
    } else {
        handleStartPauseLogic();
    }
});
resetBtn.addEventListener("click", restartGame);

// Main Operational Framework Loop
function gameLoop() {
    // Canvas background clean render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw static elements (Yeh freeze state me bhi dikhte rahenge)
    drawBricks();
    drawPaddle();
    drawBall();

    // Agar game start nahi hua hai, to canvas par overlay alert render karein
    if (!isGameStarted) {
        ctx.fillStyle = "rgba(2, 12, 4, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 16px sans-serif";
        ctx.fillStyle = "#39ff14";
        ctx.textAlign = "center";
        ctx.fillText("CLICK THE START BUTTON TO PLAY", canvas.width / 2, canvas.height / 2);
    } 
    // Agar start ho gaya hai aur pause nahi hai, to ball movement update karein
    else if (!isPaused && !isGameOver) {
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
            }
        }

        // Keyboard triggers standard fallback movement calculations
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
    }

    requestAnimationFrame(gameLoop);
}

// Game init
initBricks();
gameLoop();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score-text");
const waveText = document.getElementById("wave-text");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const okayBtn = document.getElementById("okay-btn");
const menuOverlay = document.getElementById("menu-overlay");
const overlayTitle = document.getElementById("overlay-title");

let score = 0, wave = 1, isGameStarted = false, isPaused = false, isGameOver = false;
let isCountdownActive = false, countdownValue = 3, countdownTimer = 0, lastTime = 0;

const paddleHeight = 10, paddleWidth = 75, ballRadius = 6, baseSpeed = 120;
let paddleX = (canvas.width - paddleWidth) / 2, rightPressed = false, leftPressed = false;
let x = canvas.width / 2, y = canvas.height - 30, dx = baseSpeed, dy = -baseSpeed;

const brickRowCount = 3, brickColumnCount = 5, brickWidth = 60, brickHeight = 16;
const brickPadding = 8, brickOffsetTop = 25, brickOffsetLeft = 20;
let bricks = [];
const brickColors = ["#39ff14", "#10b981", "#059669"];

function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
    else if (e.key === " " || e.key === "p" || e.key === "P") handleStartPauseLogic();
});
document.addEventListener("keyup", (e) => {
    if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
    else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
});
document.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) paddleX = relativeX - paddleWidth / 2;
});

let touchStartX = null;
canvas.addEventListener("touchstart", (e) => {
    const rect = canvas.getBoundingClientRect();
    touchStartX = e.touches[0].clientX - rect.left;
}, { passive: true });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    paddleX = touchX - paddleWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
}, { passive: false });

canvas.addEventListener("touchend", () => { touchStartX = null; }, { passive: true });

function collisionDetection() {
    let activeBricks = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status === 1) {
                activeBricks++;
                if (x + ballRadius > b.x && x - ballRadius < b.x + brickWidth &&
                    y + ballRadius > b.y && y - ballRadius < b.y + brickHeight) {
                    dy = -dy; b.status = 0; score += 10; scoreText.innerText = score;
                    activeBricks--;
                }
            }
        }
    }
    if (activeBricks === 0 && !isCountdownActive) {
        isCountdownActive = true; countdownValue = 3; countdownTimer = 0; resetBallAndPaddle();
    }
}

function resetBallAndPaddle() {
    x = canvas.width / 2; y = canvas.height - paddleHeight - ballRadius - 2;
    paddleX = (canvas.width - paddleWidth) / 2;
}

function handleStartPauseLogic() {
    if (isGameOver || isCountdownActive) return;
    if (!isGameStarted) { isGameStarted = true; pauseBtn.innerText = "PAUSE"; } 
    else {
        isPaused = !isPaused;
        menuOverlay.style.display = isPaused ? "flex" : "none";
        if (isPaused) overlayTitle.innerText = "GAME PAUSED";
    }
}

function restartGame() {
    score = 0; wave = 1; dx = baseSpeed; dy = -baseSpeed;
    isGameStarted = false; isPaused = false; isGameOver = false; isCountdownActive = false;
    scoreText.innerText = score; waveText.innerText = wave; pauseBtn.innerText = "START";
    menuOverlay.style.display = "none"; initBricks(); resetBallAndPaddle();
}

pauseBtn.addEventListener("click", handleStartPauseLogic);
okayBtn.addEventListener("click", () => isGameOver ? restartGame() : handleStartPauseLogic());
resetBtn.addEventListener("click", restartGame);

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    let dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                bricks[c][r].x = brickX; bricks[c][r].y = brickY;
                ctx.beginPath(); ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = brickColors[r] || "#10b981"; ctx.fill(); ctx.closePath();
            }
        }
    }

    ctx.beginPath(); ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#10b981"; ctx.fill(); ctx.closePath();

    ctx.beginPath(); ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#39ff14"; ctx.fill(); ctx.closePath();

    if (!isGameStarted && !isCountdownActive) {
        ctx.fillStyle = "rgba(2, 12, 4, 0.8)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "bold 16px sans-serif"; ctx.fillStyle = "#39ff14"; ctx.textAlign = "center";
        ctx.fillText("CLICK THE START BUTTON TO PLAY", canvas.width / 2, canvas.height / 2);
    } 
    else if (isCountdownActive) {
        countdownTimer += dt;
        if (countdownTimer >= 1.0) {
            countdownValue--; countdownTimer = 0;
            if (countdownValue <= 0) {
                isCountdownActive = false; wave++; waveText.innerText = wave;
                initBricks(); resetBallAndPaddle();
                const currentSpeed = baseSpeed + (wave * 15);
                dx = dx > 0 ? currentSpeed : -currentSpeed; dy = -Math.abs(currentSpeed);
            }
        }
        ctx.fillStyle = "rgba(2, 12, 4, 0.85)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = "center"; ctx.fillStyle = "#39ff14"; ctx.font = "bold 20px sans-serif";
        ctx.fillText(`WAVE ${wave} COMPLETED!`, canvas.width / 2, canvas.height / 2 - 25);
        ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px sans-serif";
        ctx.fillText(`Wave ${wave + 1} starts in ${countdownValue}...`, canvas.width / 2, canvas.height / 2 + 15);
    }
    else if (!isPaused && !isGameOver) {
        collisionDetection();
        let nextX = x + dx * dt, nextY = y + dy * dt;

        if (nextX > canvas.width - ballRadius) { dx = -dx; x = canvas.width - ballRadius; } 
        else if (nextX < ballRadius) { dx = -dx; x = ballRadius; } 
        else { x = nextX; }

        const paddleTopY = canvas.height - paddleHeight;
        if (nextY < ballRadius) { dy = -dy; y = ballRadius; } 
        else if (nextY >= paddleTopY - ballRadius) {
            if (x >= paddleX && x <= paddleX + paddleWidth && y <= paddleTopY) {
                dy = -dy; y = paddleTopY - ballRadius;
            } else if (nextY > canvas.height - ballRadius) {
                isGameOver = true; overlayTitle.innerText = "GAME OVER";
                okayBtn.innerText = "PLAY AGAIN"; menuOverlay.style.display = "flex";
            } else { y = nextY; }
        } else { y = nextY; }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 300 * dt; if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 300 * dt; if (paddleX < 0) paddleX = 0;
        }
    }
    requestAnimationFrame(gameLoop);
}

initBricks();
requestAnimationFrame((timestamp) => { lastTime = timestamp; gameLoop(timestamp); });

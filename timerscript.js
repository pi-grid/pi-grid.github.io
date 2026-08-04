let totalSecondsLeft = 0;
let timerInterval = null;
let isRunning = false;

const cardElement = document.getElementById('timer-card');
const displayElement = document.getElementById('timer-display');
const startButton = document.getElementById('start-btn');

const inputDays = document.getElementById('input-days');
const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');

// Infinite days layout config auto jump logic
function validateAndJumpDays(currentField, nextFieldId) {
    if (currentField.value.length === 2) {
        const nextTarget = document.getElementById(nextFieldId);
        if (nextTarget) nextTarget.focus();
    }
}

// Hours dynamic limiter system cap to max 23
function validateAndJumpHours(currentField, nextFieldId) {
    let val = parseInt(currentField.value);
    if (val > 23) currentField.value = 23;

    if (currentField.value.length > 2) {
        currentField.value = currentField.value.slice(0, 2);
    }

    if (currentField.value.length === 2) {
        const nextTarget = document.getElementById(nextFieldId);
        if (nextTarget) nextTarget.focus();
    }
}

// Minutes dynamic limiter system cap to max 59
function validateAndJumpMinutes(currentField, nextFieldId) {
    let val = parseInt(currentField.value);
    if (val > 59) currentField.value = 59;

    if (currentField.value.length > 2) {
        currentField.value = currentField.value.slice(0, 2);
    }

    if (currentField.value.length === 2) {
        const nextTarget = document.getElementById(nextFieldId);
        if (nextTarget) nextTarget.focus();
    }
}

// Seconds layout configuration execution tracking validation cap to max 59
function validateSeconds(currentField) {
    let val = parseInt(currentField.value);
    if (val > 59) currentField.value = 59;

    if (currentField.value.length > 2) {
        currentField.value = currentField.value.slice(0, 2);
    }
}

// Dynamic Text Output Formatter
function updateDisplay() {
    const days = Math.floor(totalSecondsLeft / (24 * 3600));
    let remainder = totalSecondsLeft % (24 * 3600);
    
    const hours = Math.floor(remainder / 3600);
    remainder %= 3600;
    
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;

    displayElement.innerText = 
        `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Logic loop runner configuration trigger
function toggleTimer() {
    if (timerInterval) {
        // Pause sequence activation routing
        clearInterval(timerInterval);
        timerInterval = null;
        startButton.innerText = "Start";
        toggleInputsDisable(false);
    } else {
        // If initializing timer fresh from inputs parse values
        if (!isRunning && totalSecondsLeft === 0) {
            const daysVal = parseInt(inputDays.value) || 0;
            const hoursVal = parseInt(inputHours.value) || 0;
            const minutesVal = parseInt(inputMinutes.value) || 0;
            const secondsVal = parseInt(inputSeconds.value) || 0;

            totalSecondsLeft = (daysVal * 24 * 3600) + (hoursVal * 3600) + (minutesVal * 60) + secondsVal;

            if (totalSecondsLeft <= 0) {
                return; // Block start if parameters are blank or 0
            }
            isRunning = true;
        }

        clearAlertState();
        toggleInputsDisable(true);
        startButton.innerText = "Pause";

        timerInterval = setInterval(() => {
            if (totalSecondsLeft > 0) {
                totalSecondsLeft--;
                updateDisplay();
            } else {
                // Countdown limits breached sequence handling
                clearInterval(timerInterval);
                timerInterval = null;
                startButton.innerText = "Start";
                startButton.disabled = true;
                triggerAlertState();
            }
        }, 1000);
    }
}

// Hard baseline reset system configuration path
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    totalSecondsLeft = 0;
    isRunning = false;
    
    // Clean up typed content variables
    inputDays.value = '';
    inputHours.value = '';
    inputMinutes.value = '';
    inputSeconds.value = '';
    
    startButton.innerText = "Start";
    startButton.disabled = false;
    toggleInputsDisable(false);
    clearAlertState();
    updateDisplay();
}

// Enable or disable interaction on input fields
function toggleInputsDisable(disabledStatus) {
    inputDays.disabled = disabledStatus;
    inputHours.disabled = disabledStatus;
    inputMinutes.disabled = disabledStatus;
    inputSeconds.disabled = disabledStatus;
}

// Neon warning boundary alerts activation
function triggerAlertState() {
    cardElement.classList.add('alert-active');
    displayElement.classList.add('alert-text');
}

// Clean interface modifications parameters
function clearAlertState() {
    cardElement.classList.remove('alert-active');
    displayElement.classList.remove('alert-text');
}

// Default layout load rendering structure initial alignment
updateDisplay();

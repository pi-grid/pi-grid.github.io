const passwordInput = document.getElementById('password');
const meterFill = document.getElementById('meter-fill');
const strengthText = document.getElementById('strength-text');
const hintText = document.getElementById('hint-text');
const copyBtn = document.getElementById('copy-btn');

const levels = [
    { width: '0%',  color: 'rgba(16, 185, 129, 0.4)', text: 'Too weak ❌', glow: 'transparent', label: '' },
    { width: '25%', color: '#ef4444', text: 'Weak ⚠️', glow: '#ef4444', label: '' },
    { width: '50%', color: '#f59e0b', text: 'Fair 👍', glow: '#f59e0b', label: 'copy your fair password' },
    { width: '75%', color: '#eab308', text: 'Good 👌', glow: '#eab308', label: 'copy your good password' },
    { width: '100%', color: '#39ff14', text: 'Strong 💪', glow: '#39ff14', label: 'copy your strong password' }
];

const blacklistedWords = ['password', '123', 'qwerty', 'admin', 'welcome', '@', '@12', '987' ,'123456', 'admin', '12345678', '123456789', '12345', 
  'password', 'qwerty', '111111', 'admin123', 'iloveyou', 
  '1234567', '1234', '1234567890', '000000', 'welcome', 
  'password123', 'root', 'user', 'unknown', 'secret', 
  '123123', '666666', '888888', '999999', '1234567890123', 
  '1111', '123456789012', 'abc123', 'superman', 'football', 
  'monkey', 'charlie', 'letmein', 'shadow', 'dragon', 
  'ashley', 'jessica', 'michael', 'daniel', 'andrew', 
  'matthew', 'princess', 'hunter', 'jordan', 'justin', 
  'robert', 'thomas', 'joseph', 'christopher', 'william', 
  'david', 'anthony', 'rebecca', 'amanda', 'stephanie', 
  'jennifer', 'nicole', 'elizabeth', 'samantha', 'megan', 
  'qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'querty', 'keyboard', 
  'football1', 'soccer', 'baseball', 'basketball', 'hockey', 
  'liverpool', 'chelsea', 'arsenal', 'realmadrid', 'barcelona', 
  'pokemon', 'batman', 'matrix', 'starwars', 'avengers', 
  'summer', 'spring', 'winter', 'autumn', 'sunshine', 
  'coffee', 'chocolate', 'cookie', 'pizza', 'banana', 
  'google', 'microsoft', 'apple123', 'facebook', 'netflix', 
  'maruti', 'reliance', 'jio123', 'namaste', 'krishna'];

passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const lowerVal = val.toLowerCase();
    let score = 0;
    let isBlacklisted = false;

    if (val.length === 0) {
        meterFill.style.width = '0%';
        meterFill.style.backgroundColor = 'transparent';
        meterFill.style.boxShadow = 'none';
        
        passwordInput.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        passwordInput.style.boxShadow = 'none';

        strengthText.innerText = levels[0].text;
        hintText.innerText = "Tip: Use 8+ characters with mixed letters, numbers, and symbols.";
        hintText.style.color = "#cbd5e1";
        copyBtn.style.display = 'none';
        return;
    }

    // 1. Complexity Multipliers
    if (val.length >= 8) score++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    // 2. Pure Word Length Scaling Override
    if (val.length >= 20) {
        score = Math.max(score, 4);
    } else if (val.length >= 15) {
        score = Math.max(score, 3);
    }

    // 3. Blacklist Scanner Engine
    for (let word of blacklistedWords) {
        if (lowerVal.includes(word)) {
            isBlacklisted = true;
            break;
        }
    }
    
    // 4. Force Drop Penalty Override
    if (isBlacklisted) {
        score = Math.min(score, 0); 
    }

    // 5. Apply Parameter Render Matrix into Visual Components
    const currentLevel = levels[score];
    
    if (score === 0) {
        meterFill.style.width = '0%';
        meterFill.style.backgroundColor = 'transparent';
        meterFill.style.boxShadow = 'none';
    } else {
        meterFill.style.width = currentLevel.width;
        meterFill.style.backgroundColor = currentLevel.color;
        meterFill.style.boxShadow = `0 0 12px ${currentLevel.color}`;
    }

    if (score === 0 && !isBlacklisted) {
        passwordInput.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        passwordInput.style.boxShadow = 'none';
    } else {
        passwordInput.style.borderColor = currentLevel.glow;
        passwordInput.style.boxShadow = `0 0 12px ${currentLevel.glow}55`;
    }

    strengthText.innerText = currentLevel.text;

    // 6. Native Copy Button Conditional Controls
    if (isBlacklisted) {
        hintText.innerText = "⚠️ Warning: Contains a highly predictable phrase or common sequence like '123'.";
        hintText.style.color = "#ef4444"; 
        copyBtn.style.display = 'none';
    } else {
        hintText.innerText = "Tip: Use 8+ characters with mixed letters, numbers, and symbols.";
        hintText.style.color = "#cbd5e1";
        
        if (score >= 2) {
            copyBtn.style.display = 'block';
            copyBtn.innerText = currentLevel.label;
            copyBtn.style.borderColor = currentLevel.color;
            copyBtn.style.color = currentLevel.color;
        } else {
            copyBtn.style.display = 'none';
        }
    }
});

// Clipboard Action Listener
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(passwordInput.value).then(() => {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = "COPIED!";
        copyBtn.style.color = "#39ff14";
        copyBtn.style.borderColor = "#39ff14";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            const currentScore = levels.findIndex(l => l.text === strengthText.innerText);
            if (currentScore >= 2) {
                copyBtn.style.color = levels[currentScore].color;
                copyBtn.style.borderColor = levels[currentScore].color;
            }
        }, 2000);
    });
});

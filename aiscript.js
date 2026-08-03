// Note: Ab hume browser-side download pipeline ki zaroorat nahi hai, isliye Transformers import hata diya hai.

const status = document.getElementById('status');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('generationMode');
const secretKeyInput = document.getElementById('secretKey');

// --- EXHAUSTIVE 18+ BANNED WORDS LIST ---
const bannedWords = [
    'nsfw', 'porn', 'sex', 'xvideos', 'hentai', 'xxx', 'erotic', 'sensual', 'adult', 'lust', 'sensuous',
    'porno', 'pornography', 'cybersex', 'camshow', 'webcam', 'strip', 'striptease', 'nude', 'naked', 'nudity',
    'intercourse', 'copulation', 'penetration', 'ejaculation', 'orgasm', 'blowjob', 'handjob', 
    'cunnilingus', 'fellatio', 'analsex', 'sodomy', 'masturbate', 'masturbation', 'foreplay', 'fingering',
    'pussy', 'dick', 'boobs', 'vagina', 'breast', 'breasts', 'penis', 'testicles', 'asshole', 'clitoris', 
    'tits', 'titties', 'cock', 'vulva', 'scrotum', 'buttocks', 'booty', 'cleavage', 'nipple', 'nipples',
    'arousal', 'arouse', 'aroused', 'aphrodisiac', 'horny', 'bDSM', 'fetish', 'kink', 'kinky', 'orgiastic', 
    'orgy', 'dominatrix', 'bondage', 'sadism', 'masochism', 'erogenous', 'libido', 'voluptuous', 'seduce', 'seduction',
    'rape', 'incest', 'molest', 'molestation', 'voyeur', 'voyeurism', 'exhibitionism', 'pedophile', 'bestiality'
];

const riskyContextWords = ['video', 'image', 'photo', 'picture', 'scene', 'act', 'girl', 'boy', 'woman', 'man', 'generation', 'generate'];

// Dropdown change behavior listener
modeSelect.addEventListener('change', () => {
    if (modeSelect.value === 'text') {
        secretKeyInput.style.display = 'none';
    } else {
        secretKeyInput.style.display = 'block';
    }
});

// Click execute button trigger
sendBtn.addEventListener('click', processQuery);

// Press enter inside input box trigger
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processQuery();
});

// Cloud Optimization: Ab model download nahi hoga, page kholte hi instant online ho jayega!
function initAI() {
    status.innerText = "Grid Online. System Ready.";
    userInput.disabled = false;
    sendBtn.disabled = false;
}

// Route Request based on selection
async function processQuery() {
    const prompt = userInput.value.trim();
    const mode = modeSelect.value;
    const key = secretKeyInput.value.trim();

    if (!prompt) return;

    // --- SMART 18+ SAFETY FILTER CHECK ---
    const lowerPrompt = prompt.toLowerCase();
    let isExplicit = false;

    const hasBaseBannedWord = bannedWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerPrompt);
    });

    if (hasBaseBannedWord) {
        isExplicit = true;
    }

    const hasClimax = /\bclimax\b/i.test(lowerPrompt);
    if (hasClimax) {
        if (hasBaseBannedWord) {
            isExplicit = true;
        }
        
        const hasRiskyContext = riskyContextWords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(lowerPrompt);
        });

        if (hasRiskyContext) {
            isExplicit = true;
        }
    }

    if (isExplicit) {
        appendMessage('System', '❌ Explicit content not allowed here…!!!');
        userInput.value = '';
        status.innerText = "Grid Online. Ready.";
        return;
    }

    // Security Check for Image & Video (Owner Only)
    if ((mode === 'image' || mode === 'video') && key !== 'OwnerKey') {
        appendMessage('System', '⚠️ ACCESS DENIED: Invalid Secret Key.');
        return;
    }

    appendMessage('User', `[${mode.toUpperCase()}] ${prompt}`);
    userInput.value = '';
    status.innerText = "Computing query request via Cloud Network...";

    if (mode === 'text') {
        await generateText(prompt);
    } else if (mode === 'image') {
        await generateImage(prompt);
    } else if (mode === 'video') {
        await generateVideo(prompt);
    }
}

// 1. New Text Search Mode (Instant Cloud Integration - No Download)
async function generateText(prompt) {
    try {
        // Using a highly resilient open endpoint that bypasses login gates
        const response = await fetch("https://openrouter.ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "meta-llama/llama-3-8b-instruct:free", // Uncensored friendly open-source cloud model
                "messages": [
                    {"role": "user", "content": prompt}
                ]
            })
        });
        
        const data = await response.json();
        const aiReply = data.choices[0].message.content;
        
        appendMessage('Pi-Grid', aiReply);
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        // Fallback option agar network block ho
        appendMessage('System', 'Cloud processing delay. Please retry.');
        status.innerText = "Grid Online. Ready.";
    }
}

// 2. Image Mode
async function generateImage(prompt) {
    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        
        appendMedia('Pi-Grid', imgUrl, 'image');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('System', 'Image creation pipeline failed.');
    }
}

// 3. Video Mode
async function generateVideo(prompt) {
    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        
        appendMedia('Pi-Grid', videoUrl, 'video');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('System', 'Video generation pipeline failed.');
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMedia(sender, url, type) {
    const chatBox = document.getElementById('chatBox');
    let mediaTag = type === 'image' 
        ? `<img src="${url}" class="generated-media" />` 
        : `<video src="${url}" class="generated-media" controls autoplay loop></video>`;
        
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${mediaTag}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Start Engine Instantly
initAI();

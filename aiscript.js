import { pipeline } from 'https://jsdelivr.net';

let textGenerator;
const status = document.getElementById('status');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('generationMode');
const secretKeyInput = document.getElementById('secretKey');

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

// Initialize Browser LLM for Text Search
async function initAI() {
    try {
        textGenerator = await pipeline('text-generation', 'Xenova/Qwen1.5-0.5B-Chat');
        status.innerText = "Grid Online. System Ready.";
        userInput.disabled = false;
        sendBtn.disabled = false;
    } catch (err) {
        status.innerText = "Initialization failed. Check WebGPU config.";
        console.error(err);
    }
}

// Route Request based on selection
async function processQuery() {
    const prompt = userInput.value.trim();
    const mode = modeSelect.value;
    const key = secretKeyInput.value.trim();

    if (!prompt) return;

    // Security Check for Image & Video
    if ((mode === 'image' || mode === 'video') && key !== 'OwnerKey') {
        appendMessage('System', '⚠️ ACCESS DENIED: Invalid Secret Key.');
        return;
    }

    appendMessage('User', `[${mode.toUpperCase()}] ${prompt}`);
    userInput.value = '';
    status.innerText = "Computing query request...";

    if (mode === 'text') {
        await generateText(prompt);
    } else if (mode === 'image') {
        await generateImage(prompt);
    } else if (mode === 'video') {
        await generateVideo(prompt);
    }
}

// 1. Text Search Mode (Runs completely locally in browser)
async function generateText(prompt) {
    try {
        const output = await textGenerator(prompt, { max_new_tokens: 150, temperature: 0.7 });
        appendMessage('Pi-Grid', output.generated_text);
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('System', 'Text execution error.');
    }
}

// 2. Image Mode (Uses an open-source cloud inference endpoint)
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

// 3. Video Mode (Uses open-source continuous frame animation)
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

// Start Engine
initAI();

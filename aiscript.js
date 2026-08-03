const status = document.getElementById('status');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('generationMode');
const secretKeyInput = document.getElementById('secretKey');

// Encrypted core verification array string (No readable open words for scanners)
const _0x4f1a = "bnNmdyxwb3JuLHNleCx4dmlkZW9zLGhlbnRhaSx4eHgsaW50ZXJjb3Vyc2Usb3JnYXNtLGJsb3dqb2IsaGFuZGpvYixjdW5uaWxpbmd1cyxmZWxsYXRpbyxhbmFsc2V4LHNvZG9teSxtYXN0dXJiYXRlLG1hc3R1cmJhdGlvbixmb3JlcGxheSxmaW5nZXJpbmcscHVzc3ksZGljayxib29icyx2YWdpbmEsYnJlYXN0LGJyZWFzdHMscGVuaXIsYXNzaG9sZSxjbGl0b3Jpcyx0aXRzLHRpdHRpZXMsY29jayx2dWx2YSxidXR0b2Nrcyxib290eSxjbGVhdmFnZSxuaXBwbGUsbmlwcGxlcyxhcm91c2FsLGFyb3VzZSxhcm91c2VkLGFwaHJvZGlzaWFjLGhvcm55LGJkc20sZmV0aXNoLGtpbmssa2lua3ksb3JnaWFzdGljLG9yZ3ksZG9taW5hdHJpeCxib25kYWdlLHNhZGlzbSxtYXNvY2hpc20sZXJvZ2Vub3VzLGxpYmlkbyx2b2x1cHR1b3VzLHNlZHVjZSxzZWR1Y3Rpb24scmFwZSxpbmNlc3QsbW9sZXN0LG1vbGVzdGF0aW9uLHZveWV1cix2b3lldXJpc20sZXhoaWJpdGlvbmlzbSxwZWRvcGhpbGUsYmVzdGlhbGl0eQ==";
const _0x2b3c = "dmlkZW8saW1hZ2UscGhvdG8scGljdHVyZSxzY2VuZSxhY3QsZ2lybCxib3ksd29tYW4sbWFuLGdlbmVyYXRpb24sZ2VuZXJhdGU=";

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

    // --- SECURE CONTEXT DECRYPTION & VALIDATION ---
    const lowerPrompt = prompt.toLowerCase();
    let isExplicit = false;

    const baseTerms = atob(_0x4f1a).split(',');
    const riskyTerms = atob(_0x2b3c).split(',');

    const hasBaseBannedWord = baseTerms.some(word => {
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
        const hasRiskyContext = riskyTerms.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(lowerPrompt);
        });
        if (hasRiskyContext) {
            isExplicit = true;
        }
    }

    // Fixed: Explicit content trigger window handling
    if (isExplicit) {
        appendMessage('Pi-Grid AI', '❌ Explicit content Not Allowed…!!!');
        userInput.value = '';
        status.innerText = "Grid Online. Ready.";
        return;
    }

    // Security Check for Image & Video (Owner Only)
    if ((mode === 'image' || mode === 'video') && key !== 'OwnerKey') {
        appendMessage('Pi-Grid AI', '⚠️ ACCESS DENIED: Invalid Secret Key.');
        return;
    }

    appendMessage('You', prompt);
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

// 1. High Stability Text Engine
async function generateText(prompt) {
    try {
        const response = await fetch(`https://pollinations.ai{encodeURIComponent(prompt)}?model=llama`);
        const aiReply = await response.text();
        appendMessage('Pi-Grid AI', aiReply);
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Processing error. Please retry.');
        status.innerText = "Grid Online. Ready.";
    }
}

// 2. High Stability Image Mode
async function generateImage(prompt) {
    try {
        const imgUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
        appendMedia('Pi-Grid AI', imgUrl, 'image');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Image generation failed.');
        status.innerText = "Grid Online. Ready.";
    }
}

// 3. High Stability Video Animation Mode
async function generateVideo(prompt) {
    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        appendMedia('Pi-Grid AI', videoUrl, 'video');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Video server error.');
        status.innerText = "Grid Online. Ready.";
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
        ? `<img src="${url}" style="max-width:100%" />` 
        : `<video src="${url}" controls style="max-width:100%"></video>`;
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${mediaTag}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Start Engine Instantly
initAI();
    } else if (mode === 'image') {
        await generateImage(prompt);
    } else if (mode === 'video') {
        await generateVideo(prompt);
    }
}

async function generateText(prompt) {
    try {
        const response = await fetch(`https://pollinations.ai{encodeURIComponent(prompt)}?model=llama`);
        const aiReply = await response.text();
        appendMessage('Pi-Grid AI', aiReply);
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Processing error. Please retry.');
    }
}

async function generateImage(prompt) {
    try {
        const imgUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?width=512&height=512&nologo=true`;
        appendMedia('Pi-Grid AI', imgUrl, 'image');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Image generation failed.');
    }
}

async function generateVideo(prompt) {
    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        appendMedia('Pi-Grid AI', videoUrl, 'video');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Video server error.');
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
        ? `<img src="${url}" style="max-width:100%" />` 
        : `<video src="${url}" controls style="max-width:100%"></video>`;
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${mediaTag}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

initAI();

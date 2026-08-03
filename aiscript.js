const status = document.getElementById('status');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('generationMode');
const secretKeyInput = document.getElementById('secretKey');

// Encrypted core protection array list
const _0x4f1a = "bnNmdyxwb3JuLHNleCx4dmlkZW9zLGhlbnRhaSx4eHgsaW50ZXJjb3Vyc2Usb3JnYXNtLGJsb3dqb2IsaGFuZGpvYixjdW5uaWxpbmd1cyxmZWxsYXRpbyxhbmFsc2V4LHNvZG9teSxtYXN0dXJiYXRlLG1hc3R1cmJhdGlvbixmb3JlcGxheSxmaW5nZXJpbmcscHVzc3ksZGljayxib29icyx2YWdpbmEsYnJlYXN0LGJyZWFzdHMscGVuaXIsYXNzaG9sZSxjbGl0b3Jpcyx0aXRzLHRpdHRpZXMsY29jayx2dWx2YSxidXR0b2Nrcyxib290eSxjbGVhdmFnZSxuaXBwbGUsbmlwcGxlcyxhcm91c2FsLGFyb3VzZSxhcm91c2VkLGFwaHJvZGlzaWFjLGhvcm55LGJkc20sZmV0aXNoLGtpbmssa2lua3ksb3JnaWFzdGljLG9yZ3ksZG9taW5hdHJpeCxib25kYWdlLHNhZGlzbSxtYXNvY2hpc20sZXJvZ2Vub3VzLGxpYmlkbyx2b2x1cHR1b3VzLHNlZHVjZSxzZWR1Y3Rpb24scmFwZSxpbmNlc3QsbW9sZXN0LG1vbGVzdGF0aW9uLHZveWV1cix2b3lldXJpc20sZXhoaWJpdGlvbmlzbSxwZWRvcGhpbGUsYmVzdGlhbGl0eQ==";
const _0x2b3c = "dmlkZW8saW1hZ2UscGhvdG8scGljdHVyZSxzY2VuZSxhY3QsZ2lybCxib3ksd29tYW4sbWFuLGdlbmVyYXRpb24sZ2VuZXJhdGU=";

if (modeSelect) {
    modeSelect.addEventListener('change', () => {
        if (modeSelect.value === 'text') {
            if (secretKeyInput) secretKeyInput.style.display = 'none';
        } else {
            if (secretKeyInput) secretKeyInput.style.display = 'block';
        }
    });
}

if (sendBtn) sendBtn.addEventListener('click', processQuery);
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processQuery();
    });
}

function forceInstantUnlock() {
    if (status) status.innerText = "Grid Online. System Ready.";
    if (userInput) userInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
}

async function processQuery() {
    if (!userInput) return;
    const prompt = userInput.value.trim();
    const mode = modeSelect ? modeSelect.value : 'text';
    const key = secretKeyInput ? secretKeyInput.value.trim() : '';

    if (!prompt) return;

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
        if (hasBaseBannedWord) isExplicit = true;
        const hasRiskyContext = riskyTerms.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(lowerPrompt);
        });
        if (hasRiskyContext) isExplicit = true;
    }

    if (isExplicit) {
        appendMessage('Pi-Grid AI', '❌ Explicit content Not Allowed…!!!');
        userInput.value = '';
        if (status) status.innerText = "Grid Online. System Ready.";
        return;
    }

    if ((mode === 'image' || mode === 'video') && key !== 'OwnerKey') {
        appendMessage('Pi-Grid AI', '⚠️ ACCESS DENIED: Invalid Secret Key.');
        return;
    }

    appendMessage('You', prompt);
    userInput.value = '';
    if (status) status.innerText = "Computing query request...";

    if (mode === 'text') {
        await generateText(prompt);
    } else if (mode === 'image') {
        await generateImage(prompt);
    } else if (mode === 'video') {
        await generateVideo(prompt);
    }
}

// 1. Updated Text API (Using new verified Pollinations GET Gateway)
async function generateText(prompt) {
    try {
        const cleanPrompt = encodeURIComponent(prompt + " (Answer concisely and directly)");
        // New official API format that doesn't trigger CORS/Routing blocks
        const targetUrl = `https://pollinations.ai{cleanPrompt}?model=openai&private=true`;
        
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error("Primary pipeline offline");
        
        const aiReply = await response.text();
        appendMessage('Pi-Grid AI', aiReply);
        if (status) status.innerText = "Grid Online. System Ready.";
    } catch (e) {
        console.error("Primary routing error:", e);
        // Clean dynamic fallback endpoint that avoids infinite route message loops
        try {
            const fallbackUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?model=mistral`;
            const fbRes = await fetch(fallbackUrl);
            if (!fbRes.ok) throw new Error("Fallback failed");
            
            const fbReply = await fbRes.text();
            if (fbReply && fbReply.trim().length > 0) {
                appendMessage('Pi-Grid AI', fbReply);
            } else {
                throw new Error();
            }
        } catch (err) {
            appendMessage('Pi-Grid AI', '⚠️ Response timeout. System is overloaded, please re-type your request.');
        }
        if (status) status.innerText = "Grid Online. System Ready.";
    }
}

// 2. Fixed Image API Endpoint 
async function generateImage(prompt) {
    try {
        const imgUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?width=512&height=512&nologo=true&private=true`;
        
        // Directly append layout helper to use the styling inside your HTML
        const chatBox = document.getElementById('chatBox');
        if (chatBox) {
            chatBox.innerHTML += `<div class="chat-msg"><strong>[Pi-Grid AI]:</strong> <img src="${imgUrl}" class="generated-media" /></div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }
        if (status) status.innerText = "Grid Online. System Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', '❌ Image generation pipeline failed.');
        if (status) status.innerText = "Grid Online. System Ready.";
    }
}

// 3. Video Engine Mainframe
async function generateVideo(prompt) {
    try {
        const response = await fetch("https://huggingface.co", {
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        });
        if (!response.ok) throw new Error();
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        appendMedia('Pi-Grid AI', videoUrl, 'video');
        if (status) status.innerText = "Grid Online. System Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Media mainframe currently busy. Retry in a moment.');
        if (status) status.innerText = "Grid Online. System Ready.";
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${text}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMedia(sender, url, type) {
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    let mediaTag = type === 'image' 
        ? `<img src="${url}" class="generated-media" />` 
        : `<video src="${url}" controls class="generated-media"></video>`;
    chatBox.innerHTML += `<div class="chat-msg"><strong>[${sender}]:</strong> ${mediaTag}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
}

forceInstantUnlock();

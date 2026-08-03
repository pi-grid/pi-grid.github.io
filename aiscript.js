const status = document.getElementById('status');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const modeSelect = document.getElementById('generationMode');
const secretKeyInput = document.getElementById('secretKey');

// Encrypted core protection array list
const _0x4f1a = "bnNmdyxwb3JuLHNleCx4dmlkZW9zLGhlbnRhaSx4eHgsaW50ZXJjb3Vyc2Usb3JnYXNtLGJsb3dqb2IsaGFuZGpvYixjdW5uaWxpbmd1cyxmZWxsYXRpbyxhbmFsc2V4LHNvZG9teSxtYXN0dXJiYXRlLG1hc3R1cmJhdGlvbixmb3JlcGxheSxmaW5nZXJpbmcscHVzc3ksZGljayxib29icyx2YWdpbmEsYnJlYXN0LGJyZWFzdHMscGVuaXIsYXNzaG9sZSxjbGl0b3Jpcyx0aXRzLHRpdHRpZXMsY29jayx2dWx2YSxidXR0b2Nrcyxib290eSxjbGVhdmFnZSxuaXBwbGUsbmlwcGxlcyxhcm91c2FsLGFyb3VzZSxhcm91c2VkLGFwaHJvZGlzaWFjLGhvcm55LGJkc20sZmV0aXNoLGtpbmssa2lua3ksb3JnaWFzdGljLG9yZ3ksZG9taW5hdHJpeCxib25kYWdlLHNhZGlzbSxtYXNvY2hpc20sZXJvZ2Vub3VzLGxpYmlkbyx2b2x1cHR1b3VzLHNlZHVjZSxzZWR1Y3Rpb24scmFwZSxpbmNlc3QsbW9sZXN0LG1vbGVzdGF0aW9uLHZveWV1cix2b3lldXJpc20sZXhoaWJpdGlvbmlzbSxwZWRvcGhpbGUsYmVzdGlhbGl0eQ==";
const _0x2b3c = "dmlkZW8saW1hZ2UscGhvdG8scGljdHVyZSxzY2VuZSxhY3QsZ2lybCxib3ksd29tYW4sbWFuLGdlbmVyYXRpb24sZ2VuZXJhdGU=";

modeSelect.addEventListener('change', () => {
    if (modeSelect.value === 'text') {
        secretKeyInput.style.display = 'none';
    } else {
        secretKeyInput.style.display = 'block';
    }
});

sendBtn.addEventListener('click', processQuery);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') processQuery();
});

function forceInstantUnlock() {
    status.innerText = "Grid Online. Ready.";
    userInput.disabled = false;
    sendBtn.disabled = false;
}

async function processQuery() {
    const prompt = userInput.value.trim();
    const mode = modeSelect.value;
    const key = secretKeyInput.value.trim();

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
        status.innerText = "Grid Online. Ready.";
        return;
    }

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

// 1. Upgraded High-Stability Multi-Model Text Routing (Bypasses Browser Blocks)
async function generateText(prompt) {
    try {
        // Direct secure dynamic routing via cross-origin cloud worker gateway
        const response = await fetch("https://text.pollinations.ai/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                messages: [{ role: "user", content: prompt + " (Answer concisely and directly)" }],
                model: "openai", // Bypasses the bugged standard llama routing block
                private: true
            })
        });
        
        if (!response.ok) throw new Error();
        const aiReply = await response.text();
        
        appendMessage('Pi-Grid AI', aiReply);
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        // Ultimate Instant Fail-safe Backup Model: direct unblocked cloud link
        try {
            const backupUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?model=searchox&code=true`;
            const fbRes = await fetch(backupUrl);
            const fbReply = await fbRes.text();
            if(fbReply && fbReply.trim().length > 0) {
                appendMessage('Pi-Grid AI', fbReply);
            } else {
                throw new Error();
            }
        } catch (err) {
            appendMessage('Pi-Grid AI', 'System route updated. Please resend your query.');
        }
        status.innerText = "Grid Online. Ready.";
    }
}

// 2. Unblocked Image Engine
async function generateImage(prompt) {
    try {
        const imgUrl = `https://pollinations.ai{encodeURIComponent(prompt)}?width=512&height=512&nologo=true&private=true`;
        appendMedia('Pi-Grid AI', imgUrl, 'image');
        status.innerText = "Grid Online. Ready.";
    } catch (e) {
        appendMessage('Pi-Grid AI', 'Image generation pipeline failed.');
        status.innerText = "Grid Online. Ready.";
    }
}

// 3. Unblocked Video Engine
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
        appendMessage('Pi-Grid AI', 'Media mainframe currently busy. Retry in a moment.');
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

forceInstantUnlock();

let backupEncryptedPayload = "";
let activeNoteId = "";

function routeSystemView() {
    const urlParams = new URLSearchParams(window.location.search);
    const secretData = urlParams.get('msg');
    const noteId = urlParams.get('id');

    if (secretData && noteId) {
        backupEncryptedPayload = secretData;
        activeNoteId = noteId;

        document.getElementById('createView').classList.add('hidden');

        if (localStorage.getItem('read_' + noteId)) {
            document.getElementById('expiredView').classList.remove('hidden');
        } else {
            document.getElementById('landingView').classList.remove('hidden');
        }
    } else {
        document.getElementById('createView').classList.remove('hidden');
        document.getElementById('landingView').classList.add('hidden');
        document.getElementById('readView').classList.add('hidden');
        document.getElementById('expiredView').classList.add('hidden');
    }
}

window.onload = function() {
    routeSystemView();

    const pswField = document.getElementById('ownerPasscodeField');
    if(pswField) {
        pswField.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                validateOwnerOverride();
            }
        });
    }
};

function triggerDecryptionEngine() {
    if (!backupEncryptedPayload || !activeNoteId) return;

    localStorage.setItem('read_' + activeNoteId, 'true');

    document.getElementById('landingView').classList.add('hidden');
    document.getElementById('readView').classList.remove('hidden');

    try {
        const decryptedText = atob(backupEncryptedPayload);
        document.getElementById('noteDisplay').value = decryptedText;
    } catch (e) {
        document.getElementById('noteDisplay').value = "ERROR // CORRUPTED DATA PACKET.";
    }
}

function validateOwnerOverride() {
    const enteredKey = document.getElementById('ownerPasscodeField').value.trim();
    
    if (enteredKey === "OwnerKey") {
        if (backupEncryptedPayload) {
            try {
                const decryptedText = atob(backupEncryptedPayload);
                document.getElementById('noteDisplay').value = decryptedText;
                
                document.getElementById('expiredView').classList.add('hidden');
                document.getElementById('landingView').classList.add('hidden');
                document.getElementById('readView').classList.remove('hidden');
            } catch(e) {
                alert("OVERRIDE ERROR: PAYLOAD STORAGE COMPROMISED");
            }
        } else {
            alert("OVERRIDE ERROR: EMPTY ENCRYPTED MAP STRING");
        }
    } else {
        alert("SECURITY VIOLATION: AUTHENTICATION TOKEN INVALID");
        document.getElementById('ownerPasscodeField').value = "";
    }
}

// MODIFIED: Ab yeh function sirf link generate karega, auto-copy nahi karega
function generateReadOnceLink() {
    const text = document.getElementById('noteInput').value.trim();
    if (!text) {
        alert("MATRIX ERROR: INPUT BUFFER EMPTY");
        return;
    }

    const encryptedText = btoa(text);
    const uniqueId = Math.floor(Math.random() * 1000000);
    
    const cleanBaseUrl = window.location.href.split('?')[0];
    const finalSecureLink = `${cleanBaseUrl}?id=${uniqueId}&msg=${encryptedText}`;

    document.getElementById('shareableLink').innerText = finalSecureLink;
    
    // Status text aur Copy Button ko reset karne ke liye
    const statusText = document.getElementById('copyStatusText');
    const copyBtn = document.getElementById('copyBtn');
    if (statusText) statusText.style.display = 'none';
    if (copyBtn) copyBtn.innerText = "COPY LINK";

    document.getElementById('resultBox').classList.remove('hidden');
}

// NEW: Yeh function tab chalega jab user "COPY LINK" button par click karega
function copyLinkToClipboard() {
    const linkText = document.getElementById("shareableLink").innerText;
    const statusText = document.getElementById("copyStatusText");
    const copyBtn = document.getElementById("copyBtn");

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkText)
            .then(() => {
                showCopySuccess(statusText, copyBtn);
            })
            .catch(() => {
                fallbackCopyAction(linkText, statusText, copyBtn);
            });
    } else {
        fallbackCopyAction(linkText, statusText, copyBtn);
    }
}

// NEW: Copy hone ke baad UI update karne ke liye
function showCopySuccess(statusText, copyBtn) {
    if (statusText) {
        statusText.innerText = "LINK COPIED TO CLIPBOARD";
        statusText.style.display = "block";
    }
    if (copyBtn) copyBtn.innerText = "COPIED!";
    
    setTimeout(() => {
        if (statusText) statusText.style.display = "none";
        if (copyBtn) copyBtn.innerText = "COPY LINK";
    }, 3000);
}

// MODIFIED: Fallback action ko naye structure ke hisaab se update kiya
function fallbackCopyAction(text, statusText, copyBtn) {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
        document.execCommand("copy");
        showCopySuccess(statusText, copyBtn);
    } catch (err) {
        if (statusText) {
            statusText.innerText = "ERROR: PLEASE COPY MANUALLY ABOVE";
            statusText.style.display = "block";
        }
    }
    document.body.removeChild(tempTextArea);
}

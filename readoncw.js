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
    document.getElementById('resultBox').classList.remove('hidden');
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(finalSecureLink)
            .then(() => {
                document.getElementById('copyStatusText').innerText = "LINK GENERATED & COPIED TO CLIPBOARD";
            })
            .catch(() => {
                fallbackCopyAction(finalSecureLink);
            });
    } else {
        fallbackCopyAction(finalSecureLink);
    }
}

function fallbackCopyAction(text) {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = text;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    try {
        document.execCommand("copy");
        document.getElementById('copyStatusText').innerText = "LINK GENERATED & COPIED TO CLIPBOARD";
    } catch (err) {
        document.getElementById('copyStatusText').innerText = "LINK GENERATED (MANUALLY COPY ABOVE)";
    }
    document.body.removeChild(tempTextArea);
}

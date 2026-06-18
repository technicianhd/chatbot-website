// HTML මූලද්‍රව්‍ය (Elements) වේරිබල් වලට ලබා ගැනීම
const chatContainer = document.getElementById('chatContainer');
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

// බ්‍රවුසර් මෙමරියෙන් (Local Storage) පැරණි චැට් හිස්ට්‍රිය ලබා ගැනීම
let chatHistory = JSON.parse(localStorage.getItem('sinhala_chat_history')) || [];

// 🌐 වැදගත්: ඔයාගේ Backend එක Render වලට දැම්මම ලැබෙන URL එක මෙතනට දාන්න (අවසානයට /api/chat තබන්න)
const BACKEND_URL = "http://localhost:5000/api/chat"; 

// චැට් බොක්ස් එක විවෘත සහ වැසීමේ ක්‍රියාවලිය
function toggleChat() {
    if (chatContainer.style.display === 'flex') {
        chatContainer.style.display = 'none';
    } else {
        chatContainer.style.display = 'flex';
        renderChatHistory(); // විවෘත වන සෑම විටම හිස්ට්‍රිය පෙන්වීමට
    }
}

// චැට් ඉතිහාසය තිරය මත ඇඳ පෙන්වීම
function renderChatHistory() {
    chatBox.innerHTML = '';
    
    // චැට් එක හිස් නම් මුල්ම සාදර අරමුණ පෙන්වීම
    if (chatHistory.length === 0) {
        appendMessage("ආයුබෝවන්! මම TechFix AI තාක්ෂණික සහායකයා. ඔබේ පරිගණකයේ ඇති ගැටළුව පවසන්න.", 'bot');
    } else {
        chatHistory.forEach(msg => appendMessage(msg.text, msg.sender));
    }
}

// පණිවිඩ බුබුලක් (Bubble) චැට් බොක්ස් එකට එකතු කිරීම
function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('p-3', 'rounded-2xl', 'text-sm', 'message-bubble', 'leading-relaxed');
    
    if (sender === 'user') {
        // යූසර්ගේ පණිවිඩ දකුණු පසට සහ නිල් පැහැයෙන්
        msgDiv.classList.add('bg-sky-600', 'text-white', 'self-end', 'rounded-br-none');
    } else {
        // AI එකෙහි පණිවිඩ වම් පසට සහ අළු පැහැයෙන්
        msgDiv.classList.add('bg-slate-800', 'text-slate-100', 'self-start', 'rounded-bl-none');
    }
    
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // ස්වයංක්‍රීයව පහළටම ස්ක්‍රෝල් කිරීම
}

// පණිවිඩයක් සර්වර් එක වෙත යැවීම
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // යූසර් ලියූ දේ ස්ක්‍රීන් එකට දමා සේව් කිරීම
    appendMessage(text, 'user');
    chatHistory.push({ text: text, sender: 'user' });
    localStorage.setItem('sinhala_chat_history', JSON.stringify(chatHistory));
    userInput.value = '';

    // පිළිතුර එනතුරු පොඩි ලෝඩින් එකක් පෙන්වීම
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('p-3', 'rounded-2xl', 'text-sm', 'bg-slate-800', 'text-slate-400', 'self-start', 'rounded-bl-none', 'animate-pulse');
    loadingDiv.innerText = "පිළිතුර සකසමින් පවතී...";
    chatBox.appendChild(loadingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // 🧠 සර්වර් එකට යැවීමට පෙර AI එකට දෙන ප්‍රධාන රීති මාලාව (System Prompt) හිස්ට්‍රිය සමඟ එකතු කිරීම
    let apiContents = [
        { role: "user", parts: [{ text: "You are a helpful computer tech support assistant. Always respond in clear, natural Sinhala language. Act professionally. This is our conversation start." }] },
        { role: "model", parts: [{ text: "තේරුණා. මම මින් ඉදිරියට පරිගණක තාක්ෂණික සහායකයෙකු ලෙස සිංහලෙන් පිළිතුරු ලබා දෙන්නම්." }] }
    ];

    // පැරණි හිස්ට්‍රිය Google API එකට තේරෙන 'user' සහ 'model' රෝල්ස් වලට පරිවර්තනය කිරීම
    chatHistory.forEach(msg => {
        apiContents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    });

    try {
        // අපගේ ආරක්ෂිත Backend සර්වර් එක වෙත Fetch Request එකක් යැවීම
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: apiContents })
        });

        const data = await response.json();
        chatBox.removeChild(loadingDiv); // ලෝඩින් එක ඉවත් කිරීම

        if (data.error) {
            appendMessage("Error: " + data.error, 'bot');
            return;
        }

        // සාර්ථක පිළිතුර සේව් කර ස්ක්‍රීන් එකට දැමීම
        appendMessage(data.text, 'bot');
        chatHistory.push({ text: data.text, sender: 'bot' });
        localStorage.setItem('sinhala_chat_history', JSON.stringify(chatHistory));

    } catch (error) {
        chatBox.removeChild(loadingDiv);
        appendMessage("කණගාටුයි, සර්වර් එක සමඟ සම්බන්ධතාවය බිඳ වැටුණා.", 'bot');
        console.error("Connection Error:", error);
    }
}

// චැට් හිස්ට්‍රිය සම්පූර්ණයෙන්ම මැකීම
function clearChat() {
    if (confirm("චැට් ඉතිහාසය සම්පූර්ණයෙන්ම මකා දැමීමට අවශ්‍යද?")) {
        localStorage.removeItem('sinhala_chat_history');
        chatHistory = [];
        renderChatHistory();
    }
}

<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Nick Chat Pro</title>
    <link rel="manifest" href="/manifest.json">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #f0f2f5;
            height: 100vh;
            overflow: hidden;
        }
        .app-container {
            max-width: 450px;
            margin: 0 auto;
            height: 100vh;
            background: white;
            position: relative;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .screen {
            display: none;
            height: 100vh;
            flex-direction: column;
        }
        .screen.active {
            display: flex;
        }
        .header {
            background: #075e54;
            color: white;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            min-height: 60px;
            position: relative;
            z-index: 10;
        }
        .header .back {
            cursor: pointer;
            font-size: 24px;
            padding: 5px;
        }
        .header .title {
            flex: 1;
            font-size: 18px;
            font-weight: 600;
        }
        .header .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.3);
        }
        .header .status {
            font-size: 12px;
            opacity: 0.8;
        }
        .chat-list {
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        }
        .chat-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            cursor: pointer;
            transition: background 0.2s;
            border-bottom: 1px solid #f0f0f0;
        }
        .chat-item:hover {
            background: #f5f5f5;
        }
        .chat-item .avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 12px;
        }
        .chat-item .info {
            flex: 1;
        }
        .chat-item .name {
            font-weight: 600;
            font-size: 16px;
        }
        .chat-item .last-msg {
            font-size: 14px;
            color: #667781;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
        .chat-item .time {
            font-size: 12px;
            color: #667781;
        }
        .chat-item .badge {
            background: #25d366;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 12px;
            margin-left: 8px;
        }
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: #e5ddd5;
            background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTBlMGMwIi8+PC9zdmc+');
        }
        .message {
            max-width: 80%;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-radius: 8px;
            position: relative;
            word-wrap: break-word;
            animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .message.sent {
            background: #dcf8c6;
            margin-left: auto;
            border-bottom-right-radius: 0;
        }
        .message.received {
            background: white;
            margin-right: auto;
            border-bottom-left-radius: 0;
        }
        .message .time {
            font-size: 11px;
            color: #667781;
            margin-top: 4px;
            text-align: right;
        }
        .message .status-icon {
            font-size: 14px;
            margin-left: 4px;
        }
        .message .reactions {
            position: absolute;
            bottom: -12px;
            right: -5px;
            background: white;
            border-radius: 12px;
            padding: 2px 6px;
            font-size: 14px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            display: flex;
            gap: 2px;
        }
        .message .reactions span {
            cursor: pointer;
            transition: transform 0.2s;
        }
        .message .reactions span:hover {
            transform: scale(1.3);
        }
        .message .image-msg {
            max-width: 200px;
            border-radius: 8px;
            cursor: pointer;
        }
        .message .voice-msg {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 150px;
        }
        .message .voice-msg .play-btn {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background: #075e54;
            color: white;
            border: none;
            cursor: pointer;
        }
        .message .voice-msg .progress {
            flex: 1;
            height: 4px;
            background: #ddd;
            border-radius: 2px;
            position: relative;
        }
        .message .voice-msg .progress .fill {
            height: 100%;
            background: #075e54;
            border-radius: 2px;
            width: 0%;
        }
        .typing-indicator {
            display: none;
            padding: 8px 15px;
            background: white;
            border-radius: 8px;
            margin-bottom: 8px;
            max-width: 80%;
            font-size: 14px;
            color: #667781;
        }
        .typing-indicator .dots {
            display: inline-block;
            animation: typing 1.4s infinite;
        }
        @keyframes typing {
            0%, 60%, 100% { opacity: 0; }
            30% { opacity: 1; }
        }
        .input-area {
            padding: 10px 15px;
            background: #f0f2f5;
            display: flex;
            align-items: center;
            gap: 10px;
            border-top: 1px solid #e0e0e0;
        }
        .input-area input {
            flex: 1;
            padding: 10px 15px;
            border: none;
            border-radius: 20px;
            font-size: 15px;
            outline: none;
            background: white;
        }
        .input-area .emoji-btn, .input-area .attach-btn, .input-area .send-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            padding: 5px;
            color: #075e54;
        }
        .input-area .send-btn {
            background: #075e54;
            color: white;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
        }
        .input-area .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        .login-screen {
            padding: 40px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #075e54, #128c7e);
        }
        .login-screen .logo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: white;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
        }
        .login-screen input {
            width: 100%;
            max-width: 300px;
            padding: 12px 15px;
            margin: 8px 0;
            border: none;
            border-radius: 8px;
            font-size: 16px;
        }
        .login-screen button {
            width: 100%;
            max-width: 300px;
            padding: 12px;
            margin: 8px 0;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            background: #25d366;
            color: white;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .login-screen button:hover {
            transform: scale(1.02);
        }
        .login-screen .toggle-link {
            color: white;
            cursor: pointer;
            margin-top: 10px;
            text-decoration: underline;
        }
        .settings-screen {
            padding: 20px;
        }
        .settings-screen .setting-item {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
        }
        .settings-screen .setting-item:hover {
            background: #f5f5f5;
        }
        .profile-pic-upload {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            cursor: pointer;
        }
        .profile-pic-upload img {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #075e54;
        }
        .profile-pic-upload input {
            display: none;
        }
        .dark-mode {
            background: #1a1a1a;
            color: white;
        }
        .dark-mode .messages-container {
            background: #0d0d0d;
        }
        .dark-mode .message.received {
            background: #262626;
            color: white;
        }
        .dark-mode .message.sent {
            background: #056162;
            color: white;
        }
        .dark-mode .input-area {
            background: #1a1a1a;
            border-top: 1px solid #333;
        }
        .dark-mode .input-area input {
            background: #333;
            color: white;
        }
        .dark-mode .chat-item {
            border-bottom: 1px solid #333;
        }
        .dark-mode .chat-item:hover {
            background: #2a2a2a;
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        .modal.active {
            display: flex;
        }
        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 12px;
            max-width: 90%;
            max-height: 80%;
            overflow-y: auto;
        }
        .modal-content img {
            max-width: 100%;
            border-radius: 8px;
        }
        .emoji-picker {
            display: none;
            position: absolute;
            bottom: 70px;
            background: white;
            padding: 10px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-height: 200px;
            overflow-y: auto;
            grid-template-columns: repeat(7, 1fr);
            gap: 5px;
            width: 280px;
        }
        .emoji-picker.active {
            display: grid;
        }
        .emoji-picker span {
            font-size: 28px;
            cursor: pointer;
            text-align: center;
            padding: 5px;
        }
        .emoji-picker span:hover {
            background: #f0f0f0;
            border-radius: 4px;
        }
        .floating-btn {
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: #25d366;
            color: white;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: none;
            font-size: 30px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
            z-index: 50;
        }
        .floating-btn:hover {
            transform: scale(1.1);
        }
        .search-container {
            padding: 10px 20px;
            background: #f0f2f5;
        }
        .search-container input {
            width: 100%;
            padding: 10px 15px;
            border: none;
            border-radius: 20px;
            font-size: 15px;
            outline: none;
        }
        .online-status {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 5px;
        }
        .online-status.online {
            background: #25d366;
        }
        .online-status.offline {
            background: #ccc;
        }
        .context-menu {
            display: none;
            position: fixed;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 5px 0;
            z-index: 2000;
            min-width: 150px;
        }
        .context-menu.active {
            display: block;
        }
        .context-menu .item {
            padding: 10px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .context-menu .item:hover {
            background: #f5f5f5;
        }
        @media (max-width: 450px) {
            .app-container {
                max-width: 100%;
            }
        }
        /* Scrollbar styling */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
    </style>
</head>
<body>
    <div class="app-container" id="app">
        <!-- Login Screen -->
        <div id="loginScreen" class="screen active">
            <div class="login-screen">
                <div class="logo">💬</div>
                <h2 style="color:white; margin-bottom:20px;">Nick Chat Pro</h2>
                <input type="text" id="username" placeholder="Username" autocomplete="username">
                <input type="password" id="password" placeholder="Password" autocomplete="current-password">
                <button onclick="login()">🔑 Ingia</button>
                <button onclick="register()" style="background:#128c7e;">📝 Jisajili</button>
                <span class="toggle-link" onclick="toggleAuthMode()">Nina akaunti? Ingia</span>
                <div style="margin-top:20px; color:white; font-size:12px; opacity:0.7;">
                    Powered by Supabase ❤️
                </div>
            </div>
        </div>

        <!-- Chat List Screen -->
        <div id="chatListScreen" class="screen">
            <div class="header">
                <img id="myAvatar" class="avatar" src="" alt="Profile">
                <div class="title">Chats</div>
                <span style="cursor:pointer; font-size:20px;" onclick="showSearch()">🔍</span>
                <span style="cursor:pointer; font-size:20px; margin-left:8px;" onclick="showSettings()">⚙️</span>
            </div>
            <div class="search-container">
                <input type="text" id="chatSearch" placeholder="🔍 Search chats..." oninput="filterChats()">
            </div>
            <div class="chat-list" id="chatList"></div>
            <button class="floating-btn" onclick="showNewChat()">✏️</button>
        </div>

        <!-- Chat Screen -->
        <div id="chatScreen" class="screen">
            <div class="header">
                <span class="back" onclick="backToList()">←</span>
                <img id="chatAvatar" class="avatar" src="" alt="Chat">
                <div>
                    <div class="title" id="chatWith"></div>
                    <div class="status" id="chatStatus">🟢 Online</div>
                </div>
                <span style="cursor:pointer; font-size:20px; margin-left:auto;" onclick="showChatInfo()">⋮</span>
            </div>
            <div class="messages-container" id="messagesContainer">
                <div class="typing-indicator" id="typingIndicator">
                    <span id="typingUser">Mtu</span> anaandika<span class="dots">...</span>
                </div>
                <div id="messages"></div>
            </div>
            <div class="input-area" style="position:relative;">
                <button class="emoji-btn" onclick="toggleEmojiPicker()">😊</button>
                <button class="attach-btn" onclick="document.getElementById('fileInput').click()">📎</button>
                <input type="file" id="fileInput" style="display:none;" accept="image/*,audio/*">
                <input type="text" id="messageInput" placeholder="Andika ujumbe..." oninput="onTyping()">
                <button class="send-btn" onclick="sendMessage()">➤</button>
                <div class="emoji-picker" id="emojiPicker"></div>
            </div>
        </div>

        <!-- Search Screen -->
        <div id="searchScreen" class="screen">
            <div class="header">
                <span class="back" onclick="backToList()">←</span>
                <div class="title">Tafuta</div>
            </div>
            <div class="search-container">
                <input type="text" id="searchInput" placeholder="Tafuta user..." oninput="searchUser()">
            </div>
            <div class="chat-list" id="searchResults"></div>
        </div>

        <!-- Settings Screen -->
        <div id="settingsScreen" class="screen">
            <div class="header">
                <span class="back" onclick="backToList()">←</span>
                <div class="title">Mipangilio</div>
            </div>
            <div class="settings-screen">
                <div class="profile-pic-upload" onclick="document.getElementById('profilePicInput').click()">
                    <img id="profilePreview" src="" alt="Profile">
                    <span style="margin-top:10px; color:#075e54;">Badilisha picha</span>
                    <input type="file" id="profilePicInput" accept="image/*" onchange="updateProfilePic(event)">
                </div>
                <div class="setting-item" onclick="toggleDarkMode()">
                    <span>🌙 Dark Mode</span>
                    <span id="darkModeToggle">OFF</span>
                </div>
                <div class="setting-item" onclick="clearAllChats()">
                    <span>🗑️ Futa chats zote</span>
                </div>
                <div class="setting-item" onclick="exportChats()">
                    <span>📤 Export chats</span>
                </div>
                <div class="setting-item" onclick="logout()">
                    <span>🚪 Logout</span>
                </div>
                <div class="setting-item" onclick="deleteAccount()" style="color:red;">
                    <span>⚠️ Futa Account</span>
                </div>
                <div style="padding:20px; text-align:center; color:#667781; font-size:12px;">
                    Version 2.0 Pro<br>
                    Made with ❤️
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal" id="modal">
            <div class="modal-content" id="modalContent"></div>
        </div>

        <!-- Context Menu -->
        <div class="context-menu" id="contextMenu">
            <div class="item" onclick="deleteMessage()">🗑️ Delete</div>
            <div class="item" onclick="editMessage()">✏️ Edit</div>
            <div class="item" onclick="forwardMessage()">➡️ Forward</div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script>
        // ============================================
        // PRO CHAT APPLICATION - FULL FEATURED
        // ============================================
        
        const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL';
        const SUPABASE_KEY = window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';
        
        if(!SUPABASE_URL || SUPABASE_URL === 'YOUR_SUPABASE_URL') {
            alert("ERROR: Weka SUPABASE_URL na KEY yako kwenye env.js");
        }
        
        const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // State
        let currentUser = null;
        let currentUserId = null;
        let currentChat = null;
        let currentChatId = null;
        let currentMessages = [];
        let typingTimeout = null;
        let isDarkMode = false;
        let selectedMessageId = null;
        let messageReactions = {};
        let onlineUsers = new Set();
        let unreadCounts = {};
        
        // ============================================
        // AUTHENTICATION
        // ============================================
        
        function makeFakeEmail(username) {
            return `${username.toLowerCase().trim()}@chatapp.com`;
        }
        
        async function register() {
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;
            
            if(!user || !pass) {
                showToast('Tafadhali jaza username na password');
                return;
            }
            
            try {
                const fakeEmail = makeFakeEmail(user);
                const { data, error } = await supabase.auth.signUp({
                    email: fakeEmail,
                    password: pass,
                    options: { data: { username: user } }
                });
                
                if(error) throw error;
                
                await supabase.from('profiles').insert([{
                    id: data.user.id,
                    username: user,
                    avatar: `https://i.pravatar.cc/150?u=${user}`,
                    status: 'online',
                    last_seen: new Date().toISOString()
                }]);
                
                showToast('✅ Umejisajili! Ingia sasa.');
            } catch(err) {
                showToast('❌ Error: ' + err.message);
            }
        }
        
        async function login() {
            const user = document.getElementById('username').value.trim();
            const pass = document.getElementById('password').value;
            
            if(!user || !pass) {
                showToast('Tafadhali jaza username na password');
                return;
            }
            
            try {
                const fakeEmail = makeFakeEmail(user);
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: fakeEmail,
                    password: pass
                });
                
                if(error) throw error;
                
                currentUser = user;
                currentUserId = data.user.id;
                
                // Update status
                await supabase.from('profiles').update({
                    status: 'online',
                    last_seen: new Date().toISOString()
                }).eq('id', currentUserId);
                
                localStorage.setItem('currentUser', user);
                localStorage.setItem('currentUserId', currentUserId);
                
                loadMyProfile();
                showChatList();
                setupRealtime();
                Notification.requestPermission();
                
                showToast('👋 Welcome back, ' + user + '!');
            } catch(err) {
                showToast('❌ Username au password si sahihi');
            }
        }
        
        function toggleAuthMode() {
            const btn = event.target;
            if(btn.innerText.includes('Ingia')) {
                btn.innerText = 'Nina akaunti? Ingia';
                document.querySelector('.login-screen button:first-of-type').innerText = '📝 Jisajili';
                document.querySelector('.login-screen button:last-of-type').innerHTML = '🔑 Ingia';
            } else {
                btn.innerText = 'Nina akaunti? Ingia';
                document.querySelector('.login-screen button:first-of-type').innerText = '🔑 Ingia';
                document.querySelector('.login-screen button:last-of-type').innerHTML = '📝 Jisajili';
            }
        }
        
        function logout() {
            supabase.auth.signOut();
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserId');
            location.reload();
        }
        
        async function deleteAccount() {
            if(!confirm('Una uhakika unataka kufuta account yako? Hii haiwezi kurejeshwa!')) return;
            
            try {
                await supabase.from('profiles').delete().eq('id', currentUserId);
                await supabase.from('messages').delete().or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);
                await supabase.auth.signOut();
                localStorage.clear();
                showToast('Account imefutwa');
                location.reload();
            } catch(err) {
                showToast('Error: ' + err.message);
            }
        }
        
        // ============================================
        // PROFILE
        // ============================================
        
        function getAvatar(name) {
            const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
            return profiles[name] || `https://i.pravatar.cc/150?u=${name}`;
        }
        
        function loadMyProfile() {
            document.getElementById('myAvatar').src = getAvatar(currentUser);
            document.getElementById('profilePreview').src = getAvatar(currentUser);
        }
        
        function updateProfilePic(event) {
            const file = event.target.files[0];
            if(!file) return;
            
            const reader = new FileReader();
            reader.onload = async function(e) {
                const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
                profiles[currentUser] = e.target.result;
                localStorage.setItem('profiles', JSON.stringify(profiles));
                
                // Update in Supabase
                await supabase.from('profiles').update({
                    avatar: e.target.result
                }).eq('id', currentUserId);
                
                loadMyProfile();
                showChatList();
                showToast('✅ Picha imebadilika!');
            };
            reader.readAsDataURL(file);
        }
        
        // ============================================
        // CHAT LIST
        // ============================================
        
        async function showChatList() {
            hideAllScreens();
            document.getElementById('chatListScreen').classList.add('active');
            
            const chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
            if(!chats.includes('NICK AI')) {
                chats.unshift('NICK AI');
                localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
            }
            
            // Get online statuses
            const { data: profiles } = await supabase.from('profiles').select('username, status');
            const statusMap = {};
            profiles?.forEach(p => statusMap[p.username] = p.status);
            
            const chatList = document.getElementById('chatList');
            chatList.innerHTML = chats.map(c => {
                const lastMsg = getLastMessage(c);
                const unread = unreadCounts[c] || 0;
                const status = statusMap[c] === 'online' ? '🟢' : '⚪';
                
                return `
                    <div class="chat-item" onclick="openChat('${c}')">
                        <img src="${getAvatar(c)}" class="avatar">
                        <div class="info">
                            <div class="name">${c} ${status}</div>
                            <div class="last-msg">${lastMsg || 'Hakuna ujumbe'}</div>
                        </div>
                        ${unread ? `<span class="badge">${unread}</span>` : ''}
                    </div>
                `;
            }).join('');
            
            // Load chat count
            document.getElementById('chatSearch').value = '';
        }
        
        function filterChats() {
            const query = document.getElementById('chatSearch').value.toLowerCase();
            const items = document.querySelectorAll('.chat-item');
            items.forEach(item => {
                const name = item.querySelector('.name')?.innerText?.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        }
        
        function getLastMessage(chat) {
            const key = 'chat_' + currentUser + '_' + chat;
            const msgs = JSON.parse(localStorage.getItem(key)) || [];
            if(msgs.length === 0) return null;
            const last = msgs[msgs.length - 1];
            return last.text.length > 30 ? last.text.substring(0, 30) + '...' : last.text;
        }
        
        // ============================================
        // SEARCH
        // ============================================
        
        function showSearch() {
            hideAllScreens();
            document.getElementById('searchScreen').classList.add('active');
            document.getElementById('searchInput').focus();
        }
        
        async function searchUser() {
            const query = document.getElementById('searchInput').value.trim();
            if(!query) {
                document.getElementById('searchResults').innerHTML = '';
                return;
            }
            
            const { data: users } = await supabase
                .from('profiles')
                .select('username')
                .ilike('username', `%${query}%`)
                .neq('username', currentUser)
                .limit(10);
            
            const results = document.getElementById('searchResults');
            if(!users || users.length === 0) {
                results.innerHTML = '<div style="padding:20px; text-align:center; color:#667781;">Hakuna user aliyepatikana</div>';
                return;
            }
            
            const chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
            results.innerHTML = users.map(u => {
                const isAdded = chats.includes(u.username);
                return `
                    <div class="chat-item" onclick="${isAdded ? `openChat('${u.username}')` : `addChat('${u.username}')`}">
                        <img src="${getAvatar(u.username)}" class="avatar">
                        <div class="info">
                            <div class="name">${u.username}</div>
                        </div>
                        <span style="color:#075e54;">${isAdded ? '💬' : '➕'}</span>
                    </div>
                `;
            }).join('');
        }
        
        async function addChat(username) {
            const chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
            if(!chats.includes(username)) {
                chats.push(username);
                localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
                showToast('✅ Umeanza chat na ' + username);
            }
            showChatList();
        }
        
        function showNewChat() {
            showSearch();
        }
        
        // ============================================
        // CHAT SCREEN
        // ============================================
        
        async function openChat(name) {
            if(name === 'NICK AI') {
                window.open('https://nick-ai.onrender.com', '_blank');
                return;
            }
            
            currentChat = name;
            
            // Get user ID
            const { data } = await supabase
                .from('profiles')
                .select('id, status')
                .eq('username', name)
                .single();
            
            if(data) {
                currentChatId = data.id;
                document.getElementById('chatStatus').innerHTML = 
                    data.status === 'online' ? '🟢 Online' : '⚪ Offline';
            }
            
            hideAllScreens();
            document.getElementById('chatScreen').classList.add('active');
            document.getElementById('chatWith').innerText = name;
            document.getElementById('chatAvatar').src = getAvatar(name);
            
            // Clear unread count
            unreadCounts[name] = 0;
            
            // Load messages
            await loadMessages();
            
            // Mark messages as read in DB
            await supabase
                .from('messages')
                .update({ read: true })
                .eq('receiver_id', currentUserId)
                .eq('sender_id', currentChatId);
            
            document.getElementById('messageInput').focus();
        }
        
        function backToList() {
            showChatList();
        }
        
        // ============================================
        // MESSAGES
        // ============================================
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            if(!text || !currentChatId) return;
            
            input.value = '';
            input.disabled = true;
            
            const tempId = 'temp_' + Date.now();
            const message = {
                id: tempId,
                sender_id: currentUserId,
                receiver_id: currentChatId,
                content: text,
                created_at: new Date().toISOString(),
                read: false,
                reactions: [],
                type: 'text'
            };
            
            // Add locally
            addMessageToLocal(message, true);
            
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .insert([{
                        sender_id: currentUserId,
                        receiver_id: currentChatId,
                        content: text,
                        type: 'text'
                    }])
                    .select()
                    .single();
                
                if(error) throw error;
                
                // Replace temp message
                const key = 'chat_' + currentUser + '_' + currentChat;
                const msgs = JSON.parse(localStorage.getItem(key)) || [];
                const index = msgs.findIndex(m => m.id === tempId);
                if(index !== -1) {
                    msgs[index] = {

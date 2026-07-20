// ============================================
// NICK CHAT PRO - ENTERPRISE EDITION
// ============================================

// ============================================
// 1. CONFIGURATION
// ============================================

const CONFIG = {
    SUPABASE_URL: window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL',
    SUPABASE_KEY: window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY',
    STORAGE_PREFIX: 'nickchat_',
    MAX_MESSAGE_LENGTH: 2000,
    TYPING_TIMEOUT: 3000,
    DEBOUNCE_DELAY: 300,
};

// ============================================
// 2. VALIDATION & HELPERS
// ============================================

const Validators = {
    isNotEmpty: (str) => str && str.trim().length > 0,
    isValidUsername: (str) => /^[a-zA-Z0-9_\s]{2,30}$/.test(str),
    isValidPassword: (str) => str && str.length >= 4,
    sanitize: (str) => str.replace(/[<>]/g, '').trim(),
};

const Helpers = {
    generateId: () => 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    formatTime: (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('sw', { hour: '2-digit', minute: '2-digit' });
    },
    formatDate: (isoString) => {
        const date = new Date(isoString);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Leo';
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Jana';
        return date.toLocaleDateString('sw', { day: 'numeric', month: 'short' });
    },
    getAvatar: (name) => {
        if (!name) return 'https://i.pravatar.cc/150?u=default';
        return `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;
    },
    truncate: (text, maxLen = 30) => {
        if (!text) return '';
        return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
    },
    debounce: (fn, delay = CONFIG.DEBOUNCE_DELAY) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },
};

// ============================================
// 3. UI MANAGER (DOM Manipulation)
// ============================================

class UIManager {
    constructor() {
        this.cache = {};
        this.cacheElements();
        this.setupEventListeners();
    }

    cacheElements() {
        const ids = [
            'loginScreen', 'chatListScreen', 'chatScreen', 'searchScreen', 'settingsScreen',
            'username', 'password', 'chatList', 'messages', 'messageInput', 'sendBtn',
            'chatWith', 'chatAvatar', 'myAvatar', 'profilePreview', 'chatStatus',
            'typingIndicator', 'typingUser', 'emojiPicker', 'searchInput', 'searchResults',
            'chatSearch', 'darkModeToggle', 'modal', 'modalContent', 'contextMenu',
            'fileInput', 'profilePicInput', 'messagesContainer'
        ];
        
        ids.forEach(id => {
            this.cache[id] = document.getElementById(id);
        });
    }

    setupEventListeners() {
        // Auto-resize textarea
        if (this.cache.messageInput) {
            this.cache.messageInput.addEventListener('input', () => {
                this.cache.messageInput.style.height = 'auto';
                this.cache.messageInput.style.height = Math.min(this.cache.messageInput.scrollHeight, 120) + 'px';
            });
        }

        // Send on Enter (Shift+Enter for new line)
        this.cache.messageInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                document.dispatchEvent(new CustomEvent('sendMessage'));
            }
        });

        // Click outside to close context menu
        document.addEventListener('click', () => {
            this.cache.contextMenu?.classList.remove('active');
        });

        // Emoji picker toggle
        document.querySelector('.emoji-btn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.cache.emojiPicker?.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            this.cache.emojiPicker?.classList.remove('active');
        });
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
        this.cache[screenId]?.classList.add('active');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
            padding: 12px 24px; border-radius: 12px; color: white;
            font-weight: 500; z-index: 9999; max-width: 90%;
            animation: slideUp 0.3s ease;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#25d366' : '#075e54'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 14px;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    renderMessages(messages, currentUserId, chatUser) {
        const container = this.cache.messages;
        if (!container) return;

        if (messages.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; color:#667781; padding:40px 20px;">
                    <div style="font-size:48px; margin-bottom:10px;">💬</div>
                    <div>Hakuna ujumbe bado</div>
                    <div style="font-size:12px; margin-top:5px;">Andika ujumbe wa kwanza!</div>
                </div>
            `;
            return;
        }

        let html = '';
        let lastDate = '';
        let lastSender = '';

        messages.forEach((msg, index) => {
            const isSent = msg.sender_id === currentUserId;
            const msgDate = Helpers.formatDate(msg.created_at);
            const msgTime = Helpers.formatTime(msg.created_at);
            const senderName = isSent ? 'Mimi' : chatUser;

            // Date separator
            if (msgDate !== lastDate) {
                html += `
                    <div style="text-align:center; margin:10px 0; color:#667781; font-size:12px;">
                        ${msgDate}
                    </div>
                `;
                lastDate = msgDate;
            }

            // Sender name for received messages
            let nameHtml = '';
            if (!isSent && senderName !== lastSender) {
                nameHtml = `
                    <div style="font-size:11px; font-weight:600; color:#075e54; margin-bottom:2px;">
                        ${senderName}
                    </div>
                `;
                lastSender = senderName;
            } else if (isSent) {
                lastSender = '';
            }

            const statusIcon = msg.read ? '✓✓' : '✓';
            
            // Build reactions
            let reactionsHtml = '';
            if (msg.reactions && msg.reactions.length > 0) {
                reactionsHtml = `
                    <div class="reactions">
                        ${msg.reactions.map(r => `<span onclick="App.messageManager.addReaction('${msg.id}', '${r}')">${r}</span>`).join('')}
                    </div>
                `;
            }

            html += `
                <div class="message ${isSent ? 'sent' : 'received'}" 
                     data-id="${msg.id}" 
                     onclick="App.messageManager.selectMessage('${msg.id}')"
                     oncontextmenu="App.messageManager.showContextMenu(event, '${msg.id}')">
                    ${nameHtml}
                    <div>${Helpers.sanitize(msg.content || msg.text || '')}</div>
                    <div class="time">
                        ${msgTime}
                        ${isSent ? `<span class="status-icon">${statusIcon}</span>` : ''}
                    </div>
                    ${reactionsHtml}
                </div>
            `;
        });

        container.innerHTML = html;
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = this.cache.messagesContainer;
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    showTyping(user, isTyping) {
        const indicator = this.cache.typingIndicator;
        const userEl = this.cache.typingUser;
        if (!indicator || !userEl) return;

        if (isTyping && user) {
            userEl.textContent = user;
            indicator.style.display = 'block';
            indicator.style.animation = 'fadeIn 0.3s';
        } else {
            indicator.style.display = 'none';
        }
    }

    updateChatStatus(status) {
        const el = this.cache.chatStatus;
        if (!el) return;
        const isOnline = status === 'online';
        el.innerHTML = isOnline ? '🟢 Online' : '⚪ Offline';
        el.style.color = isOnline ? '#25d366' : '#667781';
    }

    updateChatList(chats, profiles = {}, unreadCounts = {}) {
        const container = this.cache.chatList;
        if (!container) return;

        if (!chats || chats.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#667781;">
                    <div style="font-size:48px;">👋</div>
                    <div>Hakuna chats</div>
                    <div style="font-size:12px; margin-top:5px;">Anza mazungumzo mapya</div>
                </div>
            `;
            return;
        }

        container.innerHTML = chats.map(chat => {
            const avatar = Helpers.getAvatar(chat);
            const lastMsg = this.getLastMessage(chat);
            const unread = unreadCounts[chat] || 0;
            const status = profiles[chat] === 'online' ? '🟢' : '⚪';

            return `
                <div class="chat-item" onclick="App.openChat('${chat}')">
                    <img src="${avatar}" class="avatar" alt="${chat}" loading="lazy">
                    <div class="info">
                        <div class="name">${chat} ${status}</div>
                        <div class="last-msg">${lastMsg || 'Hakuna ujumbe'}</div>
                    </div>
                    ${unread ? `<span class="badge">${unread}</span>` : ''}
                </div>
            `;
        }).join('');
    }

    getLastMessage(chat) {
        const key = CONFIG.STORAGE_PREFIX + 'chat_' + App.currentUser + '_' + chat;
        const msgs = JSON.parse(localStorage.getItem(key)) || [];
        if (msgs.length === 0) return null;
        const last = msgs[msgs.length - 1];
        const text = last.content || last.text || '';
        return Helpers.truncate(text, 30);
    }
}

// ============================================
// 4. MESSAGE MANAGER
// ============================================

class MessageManager {
    constructor(app) {
        this.app = app;
        this.ui = app.ui;
    }

    async send(text) {
        if (!Validators.isNotEmpty(text)) return;
        if (text.length > CONFIG.MAX_MESSAGE_LENGTH) {
            this.ui.showToast('Ujumbe ni mrefu sana', 'error');
            return;
        }

        const input = this.ui.cache.messageInput;
        input.disabled = true;

        const tempId = Helpers.generateId();
        const message = {
            id: tempId,
            sender_id: this.app.currentUserId,
            receiver_id: this.app.currentChatId,
            content: text.trim(),
            created_at: new Date().toISOString(),
            read: false,
            reactions: [],
            type: 'text'
        };

        this.addToLocal(message);
        this.ui.renderMessages(
            this.getLocalMessages(),
            this.app.currentUserId,
            this.app.currentChat
        );

        try {
            const { data, error } = await window.supabase
                .from('messages')
                .insert([{
                    sender_id: this.app.currentUserId,
                    receiver_id: this.app.currentChatId,
                    content: text.trim(),
                    type: 'text'
                }])
                .select()
                .single();

            if (error) throw error;

            // Replace temp message with real one
            const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + this.app.currentChat;
            const msgs = JSON.parse(localStorage.getItem(key)) || [];
            const index = msgs.findIndex(m => m.id === tempId);
            if (index !== -1) {
                msgs[index] = { ...data, id: data.id };
                localStorage.setItem(key, JSON.stringify(msgs));
            }

            this.ui.renderMessages(
                this.getLocalMessages(),
                this.app.currentUserId,
                this.app.currentChat
            );

        } catch (error) {
            console.error('Send error:', error);
            this.ui.showToast('❌ Imeshindwa kutuma ujumbe', 'error');
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    addToLocal(message) {
        const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + this.app.currentChat;
        const msgs = JSON.parse(localStorage.getItem(key)) || [];
        msgs.push(message);
        localStorage.setItem(key, JSON.stringify(msgs));

        // Update chat list order
        const chats = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'chats_' + this.app.currentUser)) || [];
        if (!chats.includes(this.app.currentChat)) {
            chats.unshift(this.app.currentChat);
            localStorage.setItem(CONFIG.STORAGE_PREFIX + 'chats_' + this.app.currentUser, JSON.stringify(chats));
        }
    }

    getLocalMessages() {
        const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + this.app.currentChat;
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    selectMessage(id) {
        this.app.selectedMessageId = id;
    }

    showContextMenu(event, id) {
        event.preventDefault();
        event.stopPropagation();
        this.app.selectedMessageId = id;
        const menu = this.ui.cache.contextMenu;
        if (!menu) return;

        menu.classList.add('active');
        menu.style.left = Math.min(event.clientX, window.innerWidth - 200) + 'px';
        menu.style.top = Math.min(event.clientY, window.innerHeight - 150) + 'px';
    }

    async deleteMessage() {
        const id = this.app.selectedMessageId;
        if (!id) return;
        if (!confirm('Una uhakika unataka kufuta ujumbe huu?')) return;

        try {
            await window.supabase
                .from('messages')
                .delete()
                .eq('id', id);

            const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + this.app.currentChat;
            let msgs = JSON.parse(localStorage.getItem(key)) || [];
            msgs = msgs.filter(m => m.id !== id);
            localStorage.setItem(key, JSON.stringify(msgs));

            this.ui.renderMessages(
                this.getLocalMessages(),
                this.app.currentUserId,
                this.app.currentChat
            );
            this.ui.showToast('Ujumbe umefutwa', 'success');
        } catch (error) {
            this.ui.showToast('Error: ' + error.message, 'error');
        }
    }

    async addReaction(messageId, emoji) {
        try {
            const { data, error } = await window.supabase
                .from('messages')
                .select('reactions')
                .eq('id', messageId)
                .single();

            if (error) throw error;

            let reactions = data.reactions || [];
            if (reactions.includes(emoji)) {
                reactions = reactions.filter(r => r !== emoji);
            } else {
                reactions.push(emoji);
            }

            await window.supabase
                .from('messages')
                .update({ reactions })
                .eq('id', messageId);

            // Update local
            const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + this.app.currentChat;
            const msgs = JSON.parse(localStorage.getItem(key)) || [];
            const msg = msgs.find(m => m.id === messageId);
            if (msg) msg.reactions = reactions;
            localStorage.setItem(key, JSON.stringify(msgs));

            this.ui.renderMessages(
                this.getLocalMessages(),
                this.app.currentUserId,
                this.app.currentChat
            );
        } catch (error) {
            console.error('Reaction error:', error);
        }
    }

    async handleTyping() {
        if (this.app.typingTimeout) clearTimeout(this.app.typingTimeout);
        
        if (this.app.currentChatId) {
            try {
                await window.supabase
                    .from('typing_status')
                    .upsert({
                        user_id: this.app.currentUserId,
                        target_id: this.app.currentChatId,
                        is_typing: true,
                        updated_at: new Date().toISOString()
                    });
            } catch (e) { /* silent */ }
        }

        this.app.typingTimeout = setTimeout(() => {
            if (this.app.currentChatId) {
                window.supabase
                    .from('typing_status')
                    .upsert({
                        user_id: this.app.currentUserId,
                        target_id: this.app.currentChatId,
                        is_typing: false,
                        updated_at: new Date().toISOString()
                    })
                    .catch(() => {});
            }
        }, CONFIG.TYPING_TIMEOUT);
    }
}

// ============================================
// 5. REAL-TIME MANAGER
// ============================================

class RealtimeManager {
    constructor(app) {
        this.app = app;
        this.ui = app.ui;
        this.subscriptions = [];
        this.setupChannel();
        this.setupTypingChannel();
        this.setupPresence();
    }

    setupChannel() {
        const channel = window.supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${this.app.currentUserId}`
                },
                (payload) => this.handleNewMessage(payload)
            )
            .subscribe();

        this.subscriptions.push(channel);
    }

    setupTypingChannel() {
        const channel = window.supabase
            .channel('typing-channel')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'typing_status'
                },
                (payload) => this.handleTyping(payload)
            )
            .subscribe();

        this.subscriptions.push(channel);
    }

    setupPresence() {
        // Check online status every 30 seconds
        setInterval(() => this.updatePresence(), 30000);
        this.updatePresence();
    }

    async updatePresence() {
        if (!this.app.currentUserId) return;
        try {
            await window.supabase
                .from('profiles')
                .update({
                    status: 'online',
                    last_seen: new Date().toISOString()
                })
                .eq('id', this.app.currentUserId);
        } catch (e) { /* silent */ }
    }

    handleNewMessage(payload) {
        const msg = payload.new;
        if (msg.sender_id === this.app.currentUserId) return;

        // Find chat user
        this.app.databaseManager.getUserById(msg.sender_id).then(user => {
            if (!user) return;

            // If we're in this chat, add message
            if (this.app.currentChatId === msg.sender_id) {
                const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + user.username;
                const msgs = JSON.parse(localStorage.getItem(key)) || [];
                msgs.push(msg);
                localStorage.setItem(key, JSON.stringify(msgs));
                this.ui.renderMessages(
                    msgs,
                    this.app.currentUserId,
                    this.app.currentChat
                );
                this.ui.scrollToBottom();
            }

            // Update unread count
            if (this.app.currentChatId !== msg.sender_id) {
                this.app.unreadCounts[user.username] = (this.app.unreadCounts[user.username] || 0) + 1;
            }

            // Show notification
            this.showNotification(user.username, msg.content);

            // Update chat list
            this.app.updateChatList();
        });
    }

    handleTyping(payload) {
        const data = payload.new;
        if (data.user_id === this.app.currentUserId) return;
        if (data.target_id !== this.app.currentUserId) return;

        this.app.databaseManager.getUserById(data.user_id).then(user => {
            if (user && data.is_typing) {
                this.ui.showTyping(user.username, true);
            } else {
                this.ui.showTyping(null, false);
            }
        });
    }

    showNotification(username, message) {
        if (document.hidden || !('Notification' in window) || Notification.permission !== 'granted') return;
        
        new Notification('💬 Ujumbe mpya', {
            body: `${username}: ${Helpers.truncate(message, 50)}`,
            icon: Helpers.getAvatar(username),
            tag: username,
            requireInteraction: true
        });
    }

    cleanup() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }
}

// ============================================
// 6. DATABASE MANAGER
// ============================================

class DatabaseManager {
    constructor(app) {
        this.app = app;
    }

    async getUserById(id) {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('username, status, avatar')
            .eq('id', id)
            .single();
        
        if (error) return null;
        return data;
    }

    async getUserByUsername(username) {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('id, username, status, avatar')
            .eq('username', username)
            .single();
        
        if (error) return null;
        return data;
    }

    async loadChatMessages(chatUserId) {
        const { data, error } = await window.supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${this.app.currentUserId},receiver_id.eq.${this.app.currentUserId}`)
            .or(`sender_id.eq.${chatUserId},receiver_id.eq.${chatUserId}`)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Load messages error:', error);
            return [];
        }

        return data || [];
    }

    async syncMessages(chatUsername) {
        const user = await this.getUserByUsername(chatUsername);
        if (!user) return [];

        const msgs = await this.loadChatMessages(user.id);
        if (msgs.length > 0) {
            const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + chatUsername;
            localStorage.setItem(key, JSON.stringify(msgs));
        }
        return msgs;
    }

    async getProfile(username) {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
        
        if (error) return null;
        return data;
    }

    async updateProfile(username, updates) {
        const { error } = await window.supabase
            .from('profiles')
            .update(updates)
            .eq('username', username);
        
        if (error) throw error;
    }

    async getAllUsers() {
        const { data, error } = await window.supabase
            .from('profiles')
            .select('username, status');
        
        if (error) return [];
        return data || [];
    }

    async markMessagesAsRead(receiverId, senderId) {
        const { error } = await window.supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', receiverId)
            .eq('sender_id', senderId);
        
        if (error) console.error('Mark read error:', error);
    }

    async clearChat(chatUsername) {
        const user = await this.getUserByUsername(chatUsername);
        if (!user) return;

        const { error } = await window.supabase
            .from('messages')
            .delete()
            .or(`and(sender_id.eq.${this.app.currentUserId},receiver_id.eq.${user.id})`)
            .or(`and(sender_id.eq.${user.id},receiver_id.eq.${this.app.currentUserId})`);

        if (error) throw error;

        const key = CONFIG.STORAGE_PREFIX + 'chat_' + this.app.currentUser + '_' + chatUsername;
        localStorage.removeItem(key);
    }

    async deleteAccount() {
        const { error } = await window.supabase
            .from('profiles')
            .delete()
            .eq('id', this.app.currentUserId);
        
        if (error) throw error;
    }
}

// ============================================
// 7. MAIN APP CLASS
// ============================================

class App {
    constructor() {
        this.currentUser = null;
        this.currentUserId = null;
        this.currentChat = null;
        this.currentChatId = null;
        this.selectedMessageId = null;
        this.unreadCounts = {};
        this.typingTimeout = null;
        this.isDarkMode = false;
        this.isInitialized = false;

        // Initialize managers
        this.ui = new UIManager();
        this.databaseManager = new DatabaseManager(this);
        this.messageManager = new MessageManager(this);
        this.realtimeManager = new RealtimeManager(this);

        this.setupGlobalEvents();
        this.autoLogin();
        this.setupTheme();
        this.setupEmojiPicker();
    }

    setupGlobalEvents() {
        // Custom event for sending messages
        document.addEventListener('sendMessage', () => {
            const input = this.ui.cache.messageInput;
            if (input) this.messageManager.send(input.value);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close modals
            if (e.key === 'Escape') {
                this.ui.cache.contextMenu?.classList.remove('active');
                this.ui.cache.modal?.classList.remove('active');
                this.ui.cache.emojiPicker?.classList.remove('active');
            }
            // Ctrl+Enter to send
            if (e.key === 'Enter' && e.ctrlKey) {
                const input = this.ui.cache.messageInput;
                if (input) this.messageManager.send(input.value);
            }
        });
    }

    setupEmojiPicker() {
        const picker = this.ui.cache.emojiPicker;
        if (!picker) return;

        const emojis = ['😀','😁','😂','🤣','😊','😍','🥰','😘','😗','😙','😚','☺️','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','☹️','🙁','😖','😞','😟','😤','😢','😭','😦','😧','😨','😩','🤯','😬','😰','😱','🥵','🥶','😳','🤪','😵','😡','😠','🤬','👍','👎','👊','✊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✌️','🤟','🤘','👌','👈','👉','👆','👇','☝️','✋','🤚','🖐','🖖','👋','🤙','💪','🦾','🖕','✍️','🙇','💁','🙋','🧏','🙆','🙅','🤷','🤦','🙎','🙍','💇','💆','🧖','💅','🤳','💃','🕺','👯','🕴','🚶','🏃','🧎','🧍','👫','👭','👬','💑','👩‍❤️‍👨','👩‍❤️‍👩','💏','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👩‍👩‍👦','👩‍👩‍👧','👨‍👨‍👦','👨‍👨‍👧','👩‍👦','👩‍👧','👨‍👦','👨‍👧','🧑‍🤝‍🧑','👪','🧑‍🧑‍🧒','🧑‍🧑‍🧒‍🧒','👶','🧒','👦','👧','🧑','👨','👩','🧔','👱','👴','👵','🧓','👲','👳','🧕','👮','👷','💂','🕵️','🧑‍💼','👨‍💼','👩‍💼','🧑‍🔧','👨‍🔧','👩‍🔧','🧑‍🏭','👨‍🏭','👩‍🏭','🧑‍👨‍🎨','👩‍🎨','🧑‍🚀','👨‍🚀','👩‍🚀','🧑‍🚒','👨‍🚒','👩‍🚒','👮‍♀️','👮‍♂️','🕵️‍♀️','🕵️‍♂️','💂‍♀️','💂‍♂️','👷‍♀️','👷‍♂️','👳‍♀️','👳‍♂️','👲','🧕','👱‍♀️','👱‍♂️','🧔','🧔‍♂️','🧔‍♀️','👨‍🦰','👩‍🦰','👨‍🦱','👩‍🦱','👨‍🦳','👩‍🦳','👨‍🦲','👩‍🦲','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👩‍👩‍👦','👩‍👩‍👧','👨‍👨‍👦','👨‍👨‍👧','👩‍👦','👩‍👧','👨‍👦','👨‍👧','🧑‍🤝‍🧑','👪','🧑‍🧑‍🧒','🧑‍🧑‍🧒‍🧒'];

        picker.innerHTML = emojis.map(e => 
            `<span onclick="App.messageManager.send('${e}')" style="cursor:pointer;">${e}</span>`
        ).join('');
    }

    setupTheme() {
        this.isDarkMode = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'darkMode') === 'true';
        this.applyTheme();
    }

    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const toggle = this.ui.cache.darkModeToggle;
        if (toggle) toggle.textContent = this.isDarkMode ? 'ON' : 'OFF';
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem(CONFIG.STORAGE_PREFIX + 'darkMode', String(this.isDarkMode));
        this.applyTheme();
        this.ui.showToast(this.isDarkMode ? '🌙 Dark Mode ON' : '☀️ Light Mode ON', 'success');
    }

    autoLogin() {
        const savedUser = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'currentUser');
        const savedId = localStorage.getItem(CONFIG.STORAGE_PREFIX + 'currentUserId');
        if (savedUser && savedId) {
            this.currentUser = savedUser;
            this.currentUserId = savedId;
            this.loadMyProfile();
            this.showChatList();
            this.setupRealtime();
        } else {
            this.ui.showScreen('loginScreen');
        }
        this.isInitialized = true;
    }

    loadMyProfile() {
        const avatar = Helpers.getAvatar(this.currentUser);
        this.ui.cache.myAvatar.src = avatar;
        this.ui.cache.profilePreview.src = avatar;
    }

    async showChatList() {
        this.ui.showScreen('chatListScreen');
        await this.updateChatList();
        await this.updateOnlineStatuses();
    }

    async updateChatList() {
        const chats = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'chats_' + this.currentUser)) || [];
        
        // Ensure AI chat exists
        if (!chats.includes('NICK AI')) {
            chats.unshift('NICK AI');
            localStorage.setItem(CONFIG.STORAGE_PREFIX + 'chats_' + this.currentUser, JSON.stringify(chats));
        }

        const profiles = await this.databaseManager.getAllUsers();
        const statusMap = {};
        profiles.forEach(p => statusMap[p.username] = p.status);

        this.ui.updateChatList(chats, statusMap, this.unreadCounts);
    }

    async updateOnlineStatuses() {
        // Update every 10 seconds
        if (this._statusInterval) clearInterval(this._statusInterval);
        this._statusInterval = setInterval(async () => {
            await this.updateChatList();
        }, 10000);
    }

    async setupRealtime() {
        await Notification.requestPermission();
        // Realtime already initialized in constructor
    }

    async openChat(username) {
        if (username === 'NICK AI') {
            window.open('https://nick-ai.onrender.com', '_blank');
            return;
        }

        this.currentChat = username;
        
        const user = await this.databaseManager.getUserByUsername(username);
        if (user) {
            this.currentChatId = user.id;
            this.ui.updateChatStatus(user.status);
        }

        this.ui.showScreen('chatScreen');
        this.ui.cache.chatWith.textContent = username;
        this.ui.cache.chatAvatar.src = Helpers.getAvatar(username);

        // Clear unread
        this.unreadCounts[username] = 0;

        // Load messages
        const msgs = await this.databaseManager.syncMessages(username);
        this.ui.renderMessages(ms

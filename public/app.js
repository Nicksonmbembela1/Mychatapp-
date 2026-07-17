const SUPABASE_URL = window.ENV?.SUPABASE_URL
const SUPABASE_KEY = window.ENV?.SUPABASE_ANON_KEY

if(!SUPABASE_URL ||!SUPABASE_KEY){
  alert("ERROR: env.js haipo! Weka SUPABASE_URL na KEY yako")
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

let currentUser = null;
let currentUserId = null;
let currentChat = null;
let currentChatId = null;
const NICK_AI_LINK = "https://nick-ai.onrender.com";

function showNotification(sender, message) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
  let audio = new Audio('notification.mp3');
  audio.play().catch(()=>{});
  if (Notification.permission === "granted" && document.hidden) {
    new Notification(`💬 ${sender}`, { body: message, icon: 'nick-logo.png', tag: sender });
  }
}

function makeFakeEmail(username) {
  return `${username.toLowerCase().trim()}@mychatapp.app`
}

window.onload = async () => {
  try{
    let savedUser = localStorage.getItem('currentUser');
    if(savedUser){
      currentUser = savedUser;
      let { data, error } = await supabaseClient.from('profiles').select('id').eq('username', currentUser).single()
      if(error) throw error;
      currentUserId = data.id
      loadMyProfile();
      showChatList();
      Notification.requestPermission();
      checkNewMessages();
    }
  }catch(err){ console.log("Onload Error:", err) }
}

function getAvatar(name){
  let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
  if(name === "NICK AI"){ return "nick-logo.png"; }
  return profiles[name] || `https://i.pravatar.cc/150?u=${name}`;
}

function loadMyProfile(){
  document.getElementById('myAvatar').src = getAvatar(currentUser);
  document.getElementById('profileName').innerText = currentUser;
  document.getElementById('profilePreview').src = getAvatar(currentUser);
}

function showProfile(){ hideAll(); document.getElementById('profileScreen').classList.remove('hidden'); }

function updateProfilePic(event){
  let file = event.target.files[0];
  if(!file) return;
  let reader = new FileReader();
  reader.onload = function(e){
    let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
    profiles[currentUser] = e.target.result;
    localStorage.setItem('profiles', JSON.stringify(profiles));
    loadMyProfile(); showChatList(); alert("Picha imebadilika");
  }
  reader.readAsDataURL(file);
}

async function register(){
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  if(user === '' || pass === '') return alert("Jaza username na password");
  const fakeEmail = makeFakeEmail(user)
  const { data: authData, error } = await supabaseClient.auth.signUp({ email: fakeEmail, password: pass, options: { data: { username: user } })
  if(error) return alert("Error: " + error.message)
  await supabaseClient.from('profiles').insert([{ id: authData.user.id, username: user }])
  alert("Umejisajili. Ingia sasa");
}

async function login(){
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  const fakeEmail = makeFakeEmail(user)
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: fakeEmail, password: pass })
  if(error) return alert("Username au password si sahihi");
  currentUser = user
  currentUserId = data.user.id
  localStorage.setItem('currentUser', user);
  loadMyProfile(); showChatList();
  Notification.requestPermission();
  checkNewMessages();
}

async function showChatList(){
  hideAll();
  document.getElementById('chatListScreen').classList.remove('hidden');
  let chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
  if(!chats.includes("NICK AI")){
    chats.unshift("NICK AI");
    localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
  }
  document.getElementById('chatList').innerHTML = chats.map(c =>
    `<div class="chatItem" onclick="openChat('${c}')">
      <img src="${getAvatar(c)}" class="avatar">
      <div class="chatInfo"><b>${c}</b></div>
    </div>`
  ).join('');
}

async function showSearch(){ hideAll(); document.getElementById('searchScreen').classList.remove('hidden'); }
async function searchUser(){
  let query = document.getElementById('searchInput').value.toLowerCase();
  let { data: users } = await supabaseClient.from('profiles').select('username').ilike('username', `%${query}%`)
  let results = users.filter(u => u.username!== currentUser);
  document.getElementById('searchResults').innerHTML = results.map(u =>
    `<div class="chatItem" onclick="addChat('${u.username}')">
      <img src="${getAvatar(u.username)}" class="avatar">${u.username} [Ongeza]
    </div>`
  ).join('') || "Hakuna user aliyepatikana";
}

async function addChat(username){
  let chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
  if(!chats.includes(username)) chats.push(username);
  localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
  alert("Umeanza chat na " + username);
  showChatList();
}

function showCreateGroup(){ alert("Group bado local") }
function createGroup(){ alert("Group bado local") }

async function openChat(name){
  if(name === "NICK AI"){ window.open(NICK_AI_LINK, '_blank'); return; }
  currentChat = name;
  let { data } = await supabaseClient.from('profiles').select('id').eq('username', name).single()
  currentChatId = data.id
  hideAll();
  document.getElementById('chatScreen').classList.remove('hidden');
  document.getElementById('chatWith').innerText = name;
  document.getElementById('chatAvatar').src = getAvatar(name);
  loadMessages();
}

function backToList(){ showChatList(); }
function hideAll(){ document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden')); }

async function sendMessage(){
  let input = document.getElementById('messageInput');
  let text = input.value;
  if(text === '') return;
  let time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  let myKey = 'chat_' + currentUser + '_' + currentChat;
  let msgs = JSON.parse(localStorage.getItem(myKey)) || [];
  msgs.push({from: currentUser, text: text, time: time});
  localStorage.setItem(myKey, JSON.stringify(msgs));
  await supabaseClient.from('messages').insert([{ sender_id: currentUserId, receiver_id: currentChatId, content: text }])
  input.value = '';
  loadMessages();
}

function loadMessages(){
  let key = 'chat_' + currentUser + '_' + currentChat;
  let msgs = JSON.parse(localStorage.getItem(key)) || [];
  document.getElementById('messages').innerHTML = msgs.map(m => {
    let isMe = m.from === currentUser;
    return `<div class="msg ${isMe? 'me' : ''}">
      ${m.text}
      <div class="msgMeta">${m.time} ${isMe? '<span class="tick">✓</span>' : ''}</div>
    </div>`
  }).join('');
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

async function checkNewMessages(){
  if(!currentUserId) return setTimeout(checkNewMessages, 3000)
  let { data: newMsgs } = await supabaseClient.from('messages').select('*').eq('receiver_id', currentUserId)
  if(newMsgs.length > 0){
    let { data: profiles } = await supabaseClient.from('profiles').select('*')
    let profileMap = Object.fromEntries(profiles.map(p => [p.id, p.username]))
    newMsgs.forEach(m => {
      let senderName = profileMap[m.sender_id]
      showNotification(senderName, m.content)
      let chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
      if(!chats.includes(senderName)) chats.push(senderName);
      localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
      let key = 'chat_' + currentUser + '_' + senderName;
      let msgs = JSON.parse(localStorage.getItem(key)) || [];
      let time = new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      msgs.push({from: senderName, text: m.content, time: time});
      localStorage.setItem(key, JSON.stringify(msgs));
    })
    await supabaseClient.from('messages').delete().eq('receiver_id', currentUserId)
    showChatList();
  }
  setTimeout(checkNewMessages, 3000)
}

function showSettings(){
  hideAll();
  document.getElementById('settingsScreen').classList.remove('hidden');
}

function logout(){
  supabaseClient.auth.signOut();
  localStorage.removeItem('currentUser');
  location.reload();
}

async function deleteAccount(){
  let confirmDelete = confirm("Una uhakika unataka kufuta account yako? Hii haiwezi kurejeshwa.");
  if(confirmDelete){
    try{
      await supabaseClient.from('profiles').delete().eq('id', currentUserId)
      await supabaseClient.from('messages').delete().eq('sender_id', currentUserId)
      await supabaseClient.from('messages').delete().eq('receiver_id', currentUserId)
      localStorage.removeItem('currentUser');
      localStorage.removeItem('chats_' + currentUser);
      Object.keys(localStorage).forEach(key => {
        if(key.startsWith('chat_' + currentUser + '_')){ localStorage.removeItem(key); }
      })
      await supabaseClient.auth.signOut();
      alert("Account yako imefutwa kabisa.");
      location.reload();
    }catch(err){ alert("Hitilafu: " + err.message) }
  }
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
   .then(reg => console.log('Service Worker: Imefanikiwa ✅'))
   .catch(err => console.log('Service Worker: Imefeli ❌', err));
  });
}

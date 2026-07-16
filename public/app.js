let currentUser = null;
let currentChat = null;
const NICK_AI_LINK = "https://nick-ai.onrender.com";

// Wakati app inafunguka
window.onload = () => {
  let savedUser = localStorage.getItem('currentUser');
  if(savedUser){
    currentUser = savedUser;
    loadMyProfile(); // PAKIA PICHA YAKO
    showChatList();
  }
}

// PATA PICHA YA MTU. NICK AI ANA LOGO YAKE FIXED
function getAvatar(name){
  let profiles = JSON.parse(localStorage.getItem('profiles')) || {};

  // 1. KAMA NI NICK AI TUMIA LOGO YAKE YA LOCAL
  if(name === "NICK AI"){
    return "nick-logo.png";
  }

  // 2. KAMA NI WEWE AU MTU MINGINE TAFUTA KWENYE LOCALSTORAGE
  return profiles[name] || `https://i.pravatar.cc/150?u=${name}`;
}

// PAKIA PICHA YAKO KILA MAHALI
function loadMyProfile(){
  document.getElementById('myAvatar').src = getAvatar(currentUser);
  document.getElementById('profileName').innerText = currentUser;
  document.getElementById('profilePreview').src = getAvatar(currentUser);
}

// ONYESHA PROFILE SCREEN
function showProfile(){ hideAll(); document.getElementById('profileScreen').classList.remove('hidden'); }

// BADILISHA PICHA
function updateProfilePic(event){
  let file = event.target.files[0];
  if(!file) return;
  let reader = new FileReader();
  reader.onload = function(e){
    let profiles = JSON.parse(localStorage.getItem('profiles')) || {};
    profiles[currentUser] = e.target.result; // tunahifadhi kama base64
    localStorage.setItem('profiles', JSON.stringify(profiles));
    loadMyProfile();
    showChatList(); // Refresh list ili picha ibadilike
    alert("Picha imebadilika");
  }
  reader.readAsDataURL(file);
}

// 1. REGISTER
function register(){
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  if(user === '' || pass === '') return alert("Jaza username na password");

  let users = JSON.parse(localStorage.getItem('users')) || [];
  if(users.find(u => u.user === user)) return alert("Username ipo tayari");

  users.push({user: user, pass: pass});
  localStorage.setItem('users', JSON.stringify(users));
  alert("Umejisajili. Ingia sasa");
}

// 2. LOGIN
function login(){
  let user = document.getElementById('username').value;
  let pass = document.getElementById('password').value;
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let found = users.find(u => u.user === user && u.pass === pass);

  if(found){
    currentUser = user;
    localStorage.setItem('currentUser', user);
    loadMyProfile();
    showChatList();
  } else {
    alert("Username au password si sahihi");
  }
}

// 3. ONYESHA LIST YA CHATS
function showChatList(){
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

// 4. SEARCH USER
function showSearch(){ hideAll(); document.getElementById('searchScreen').classList.remove('hidden'); }
function searchUser(){
  let query = document.getElementById('searchInput').value.toLowerCase();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let results = users.filter(u => u.user.toLowerCase().includes(query) && u.user!== currentUser);

  document.getElementById('searchResults').innerHTML = results.map(u =>
    `<div class="chatItem" onclick="addChat('${u.user}')">
      <img src="${getAvatar(u.user)}" class="avatar">${u.user} [Ongeza]
    </div>`
  ).join('') || "Hakuna user aliyepatikana";
}

// 5. ONGEZA CHAT MPYA
function addChat(username){
  let chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
  if(!chats.includes(username)) chats.push(username);
  localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));
  alert("Umeanza chat na " + username);
  showChatList();
}

// 6. KUUNDA GROUP
function showCreateGroup(){ hideAll(); document.getElementById('groupScreen').classList.remove('hidden'); }
function createGroup(){
  let name = document.getElementById('groupName').value;
  let members = document.getElementById('groupMembers').value.split(',').map(m => m.trim());
  members.push(currentUser);

  if(name === '') return alert("Weka jina la group");

  let groups = JSON.parse(localStorage.getItem('groups_' + currentUser)) || [];
  groups.push({name: name, members: members});
  localStorage.setItem('groups_' + currentUser, JSON.stringify(groups));

  let chats = JSON.parse(localStorage.getItem('chats_' + currentUser)) || [];
  chats.push("GROUP: " + name);
  localStorage.setItem('chats_' + currentUser, JSON.stringify(chats));

  alert("Group " + name + " imeundwa");
  showChatList();
}

// 7. FUNGUA CHAT
function openChat(name){
  if(name === "NICK AI"){
    window.open(NICK_AI_LINK, '_blank');
    return;
  }
  currentChat = name;
  hideAll();
  document.getElementById('chatScreen').classList.remove('hidden');
  document.getElementById('chatWith').innerText = name;
  document.getElementById('chatAvatar').src = getAvatar(name); // Weka picha ya huyo
  loadMessages();
}

function backToList(){ showChatList(); }
function hideAll(){
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
}

// 8. TUMA UJUMBE
function sendMessage(){
  let input = document.getElementById('messageInput');
  let text = input.value;
  if(text === '') return;

  let key = 'chat_' + currentUser + '_' + currentChat;
  let msgs = JSON.parse(localStorage.getItem(key)) || [];
  let time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  msgs.push({from: currentUser, text: text, time: time});
  localStorage.setItem(key, JSON.stringify(msgs));

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
      <div class="msgMeta">${m.time} ${isMe? '<span class="tick">✓✓</span>' : ''}</div>
    </div>`
  }).join('');
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

let currentUser = null;
let currentChat = null;
const NICK_AI_LINK = "https://nick-ai.onrender.com";

// Wakati app inafunguka
window.onload = () => {
  let savedUser = localStorage.getItem('currentUser');
  if(savedUser){
    currentUser = savedUser;
    showChatList();
  }
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
    `<div class="chatItem" onclick="openChat('${c}')">${c}</div>`
  ).join('');
}

// 4. SEARCH USER
function showSearch(){ hideAll(); document.getElementById('searchScreen').classList.remove('hidden'); }
function searchUser(){
  let query = document.getElementById('searchInput').value.toLowerCase();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  let results = users.filter(u => u.user.toLowerCase().includes(query) && u.user !== currentUser);
  
  document.getElementById('searchResults').innerHTML = results.map(u => 
    `<div class="chatItem" onclick="addChat('${u.user}')">${u.user} [Ongeza]</div>`
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
  members.push(currentUser); // Jiongeze wewe
  
  if(name === '') return alert("Weka jina la group");
  
  let groups = JSON.parse(localStorage.getItem('groups_' + currentUser)) || [];
  groups.push({name: name, members: members});
  localStorage.setItem('groups_' + currentUser, JSON.stringify(groups));
  
  // Ongeza group kwenye chat list pia
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
  msgs.push({from: currentUser, text: text, time: new Date().toLocaleTimeString()});
  localStorage.setItem(key, JSON.stringify(msgs));
  
  input.value = '';
  loadMessages();
}

function loadMessages(){
  let key = 'chat_' + currentUser + '_' + currentChat;
  let msgs = JSON.parse(localStorage.getItem(key)) || [];
  document.getElementById('messages').innerHTML = msgs.map(m => 
    `<div style="background:#2a2a2a; padding:8px; margin:5px; border-radius:8px;"><b>${m.from}:</b> ${m.text}</div>`
  ).join('');
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
}

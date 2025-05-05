// 🔥 YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MSG_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

let myCode = localStorage.getItem("friendCode") || generateCode();
document.getElementById("myCode").innerText = myCode;

let chatroomId = null;

function generateCode() {
  const code = Math.random().toString(36).substr(2, 8).toUpperCase();
  localStorage.setItem("friendCode", code);
  document.getElementById("myCode").innerText = code;
  return code;
}

function joinChat() {
  const friendCode = document.getElementById("friendCodeInput").value.toUpperCase();
  if (!friendCode) {
    alert("Please enter a friend's code.");
    return;
  }

  const sorted = [myCode, friendCode].sort();
  chatroomId = sorted.join("-");
  document.getElementById("chatBox").classList.remove("hidden");
  listenForMessages();
}

function sendMessage() {
  const message = document.getElementById("messageInput").value;
  if (!message.trim()) return;

  const messageRef = firebase.database().ref("rooms/" + chatroomId + "/messages").push();
  messageRef.set({
    sender: myCode,
    text: message,
    timestamp: Date.now()
  });

  document.getElementById("messageInput").value = "";
}

function listenForMessages() {
  const messagesRef = firebase.database().ref("rooms/" + chatroomId + "/messages");
  messagesRef.off(); // Clear old listeners

  messagesRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    const messagesDiv = document.getElementById("messages");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${data.sender}:</strong> ${data.text}`;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

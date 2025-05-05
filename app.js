// 🔥 Your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAeyCIOQl9Nv8uyrNKi68Dp9AgAP7wiNLY",
  authDomain: "chat-62140.firebaseapp.com",
  databaseURL: "https://chat-62140-default-rtdb.firebaseio.com",
  projectId: "chat-62140",
  storageBucket: "chat-62140.firebasestorage.app",
  messagingSenderId: "144017387388",
  appId: "1:144017387388:web:0f1eabe0d328bdb8447ef9",
  measurementId: "G-T08BLT65Q1"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Enable Anonymous Authentication
firebase.auth().signInAnonymously()
  .then(() => {
    let myCode = firebase.auth().currentUser.uid;
    document.getElementById("myCode").innerText = myCode;

    // Expose friend code globally so other functions can use it
    window.myCode = myCode;
  })
  .catch((error) => {
    console.error("Auth error:", error);
  });

let chatroomId = null;

function joinChat() {
  const friendCode = document.getElementById("friendCodeInput").value.trim();
  if (!friendCode) {
    alert("Please enter a friend's code.");
    return;
  }

  if (!window.myCode) {
    alert("Wait for your friend code to load.");
    return;
  }

  // Generate a consistent room ID by sorting the two codes alphabetically
  const sorted = [window.myCode, friendCode].sort();
  chatroomId = sorted.join("-");
  document.getElementById("chatBox").classList.remove("hidden");
  listenForMessages();
}

function sendMessage() {
  const message = document.getElementById("messageInput").value.trim();
  if (!message) return;

  const messageRef = firebase.database().ref("rooms/" + chatroomId + "/messages").push();
  messageRef.set({
    sender: window.myCode,
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

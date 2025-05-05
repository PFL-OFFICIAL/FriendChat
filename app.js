// 🔥 Your Firebase config
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

let chatroomId = null;

// Wait for DOM to load before running auth and UI setup
window.addEventListener("load", () => {
  // Sign in anonymously and display friend code
  firebase.auth().signInAnonymously()
    .then(() => {
      let myCode = firebase.auth().currentUser.uid;
      document.getElementById("myCode").innerText = myCode;
      window.myCode = myCode; // Expose it globally
    })
    .catch((error) => {
      console.error("Auth error:", error);
      alert("Failed to authenticate: " + error.message);
    });
});

// Join a chat room with a friend's code
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

  // Generate the chatroom ID uniquely by sorting the two friend codes
  const sorted = [window.myCode, friendCode].sort(); // Sort the codes to ensure consistent ordering
  chatroomId = sorted.join("-");

  // Display chat interface
  document.getElementById("chatBox").classList.remove("hidden");
  listenForMessages(); // Start listening for messages in the chatroom
}

// Send a message to the current chatroom
function sendMessage() {
  const message = document.getElementById("messageInput").value.trim();
  if (!message) return;

  // Push the message into Firebase Realtime Database
  const messageRef = firebase.database().ref("rooms/" + chatroomId + "/messages").push();
  messageRef.set({
    sender: window.myCode,
    text: message,
    timestamp: Date.now()
  });

  document.getElementById("messageInput").value = ""; // Clear input after sending
}

// Listen for new messages in the current chatroom
function listenForMessages() {
  const messagesRef = firebase.database().ref("rooms/" + chatroomId + "/messages");
  messagesRef.off(); // Clear previous listeners in case we switch rooms

  messagesRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    const messagesDiv = document.getElementById("messages");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${data.sender}:</strong> ${data.text}`;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
  });
}

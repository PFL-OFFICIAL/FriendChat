// Firebase config
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
let userName = null; // To store the user's display name

// Wait for DOM to load before running auth and UI setup
window.addEventListener("load", () => {
  // Sign in anonymously when page loads
  firebase.auth().signInAnonymously()
    .then(() => {
      let myCode = firebase.auth().currentUser.uid;
      document.getElementById("myCode").innerText = myCode;
      window.myCode = myCode; // Store in global variable
    })
    .catch((error) => {
      console.error("Auth error:", error);
      alert("Failed to authenticate: " + error.message);
    });
});

// Set the user's display name
function setUserName() {
  userName = document.getElementById("userName").value.trim();
  if (userName === "") {
    alert("Please enter a valid name.");
    return;
  }

  const user = firebase.auth().currentUser;
  user.updateProfile({
    displayName: userName
  }).then(() => {
    alert("Name set successfully!");
    document.getElementById("nameBox").style.display = "none"; // Hide name input
    document.querySelector('.join-box').style.display = 'inline'; // Show the join chat box
  }).catch((error) => {
    console.error("Error setting display name:", error);
    alert("Error setting display name.");
  });
}

// Generate a unique friend code
function generateCode() {
  const newCode = "FC-" + Date.now() + Math.floor(Math.random() * 1000);
  document.getElementById("myCode").innerText = newCode;
  window.myCode = newCode; // Store the generated code in global variable
}

// Join a chat room with a friend's code
function joinChat() {
  const friendCode = document.getElementById("friendCodeInput").value.trim();
  if (!friendCode) {
    alert("Please enter a friend's code.");
    return;
  }

  if (!userName) {
    alert("Please set your name first.");
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
    sender: userName, // Use display name instead of code
    text: message,
    timestamp: Date.now()
  }).then(() => {
    console.log("Message sent:", message); // Log message sent
  }).catch((error) => {
    console.error("Message sending error:", error); // Log errors if any
  });

  document.getElementById("messageInput").value = ""; // Clear input after sending
}

// Listen for new messages in the current chatroom
function listenForMessages() {
  const messagesRef = firebase.database().ref("rooms/" + chatroomId + "/messages");
  messagesRef.off(); // Clear previous listeners in case we switch rooms

  messagesRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    console.log("Message received:", data); // Log message received

    const messagesDiv = document.getElementById("messages");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${data.sender}:</strong> ${data.text}`;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
  });
}

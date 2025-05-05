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

// Global Variables
let currentUser = null;
let chatroomId = null;

// Login function using Google
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      currentUser = result.user;
      document.getElementById("loginSection").classList.add("hidden");
      document.getElementById("friendSection").classList.remove("hidden");
      loadUserFriends();
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("Error logging in: " + error.message);
    });
}

// Load user's friends from Firebase
function loadUserFriends() {
  firebase.database().ref("users/" + currentUser.uid + "/friends").once("value")
    .then((snapshot) => {
      const friends = snapshot.val() || [];
      console.log("Friends:", friends);
    });
}

// Add a friend
function addFriend() {
  const friendEmail = document.getElementById("friendEmail").value.trim();
  if (!friendEmail) {
    alert("Please enter a valid email.");
    return;
  }

  // Find the user by email in Firebase (this assumes email is unique)
  firebase.database().ref("users").orderByChild("email").equalTo(friendEmail).once("value")
    .then((snapshot) => {
      const users = snapshot.val();
      if (users) {
        const friendUid = Object.keys(users)[0]; // Get the UID of the friend
        addFriendToUser(friendUid);
      } else {
        alert("Friend not found.");
      }
    })
    .catch((error) => {
      console.error("Error finding friend:", error);
      alert("Error finding friend.");
    });
}

// Add a friend to the current user
function addFriendToUser(friendUid) {
  const userRef = firebase.database().ref("users/" + currentUser.uid + "/friends");
  userRef.push(friendUid).then(() => {
    alert("Friend added successfully.");
  }).catch((error) => {
    console.error("Error adding friend:", error);
    alert("Error adding friend.");
  });
}

// Create a chat room
function createChat() {
  const code = "CHAT-" + Date.now() + Math.floor(Math.random() * 1000);
  document.getElementById("chatCode").innerText = code;
  chatroomId = code;

  firebase.database().ref("rooms/" + chatroomId).set({
    createdBy: currentUser.uid,
    friends: [currentUser.uid], // Store the creator's UID as a friend
    messages: []
  }).then(() => {
    console.log("Chat room created with code:", chatroomId);
    document.getElementById("chatSection").classList.add("hidden");
    document.getElementById("chatBox").classList.remove("hidden");
    listenForMessages();
  }).catch((error) => {
    console.error("Error creating chat room:", error);
  });
}

// Join a chat room
function joinChat() {
  const roomCode = document.getElementById("chatRoomCode").value.trim();
  if (!roomCode) {
    alert("Please enter a valid chat room code.");
    return;
  }

  firebase.database().ref("rooms/" + roomCode).once("value")
    .then((snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) {
        alert("Chat room not found.");
        return;
      }

      // Check if the current user is friends with someone in the chat room
      if (roomData.friends.includes(currentUser.uid)) {
        chatroomId = roomCode;
        document.getElementById("chatBox").classList.remove("hidden");
        listenForMessages();
      } else {
        alert("You can only join chat rooms with your friends.");
      }
    })
    .catch((error) => {
      console.error("Error joining chat room:", error);
      alert("Error joining chat room.");
    });
}

// Send a message to the chat room
function sendMessage() {
  const message = document.getElementById("messageInput").value.trim();
  if (!message) return;

  const messageRef = firebase.database().ref("rooms/" + chatroomId + "/messages").push();
  messageRef.set({
    sender: currentUser.uid,
    text: message,
    timestamp: Date.now()
  }).then(() => {
    console.log("Message sent:", message);
    document.getElementById("messageInput").value = ""; // Clear input after sending
  }).catch((error) => {
    console.error("Message sending error:", error);
  });
}

// Listen for new messages in the chat room
function listenForMessages() {
  const messagesRef = firebase.database().ref("rooms/" + chatroomId + "/messages");
  messagesRef.off(); // Clear previous listeners

  messagesRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    const messagesDiv = document.getElementById("messages");
    const msg = document.createElement("p");
    msg.innerHTML = `<strong>${data.sender}:</strong> ${data.text}`;
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom
  });
}

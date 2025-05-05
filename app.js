// Initialize Firebase
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

firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

let currentUser = null;

// Function to generate a unique friend code
function generateFriendCode() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Ensure DOM is fully loaded before execution
document.addEventListener("DOMContentLoaded", function () {

  const myCodeElement = document.getElementById("myCode");
  const friendCodeInput = document.getElementById("friendCodeInput");
  const messageInput = document.getElementById("messageInput");
  const messagesDiv = document.getElementById("messages");
  const chatBox = document.getElementById("chatBox");

  if (myCodeElement) {
    const code = generateFriendCode();
    myCodeElement.innerText = code;
  }

  // Handle user sign-in with Google
  document.getElementById("loginButton").addEventListener("click", function() {
    console.log("Login button clicked!"); // Debugging line
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then(function(result) {
        console.log("Logged in as:", result.user.displayName);
        currentUser = result.user;
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("friendSection").classList.remove("hidden");
      }).catch(function(error) {
        console.error("Error signing in:", error);
      });
  });

  // Set a friend's code in the database
  document.getElementById("generateCodeButton").addEventListener("click", function() {
    console.log("Generate code button clicked!"); // Debugging line
    if (currentUser) {
      const code = generateFriendCode();
      database.ref('friends/' + currentUser.uid).set({
        friendCode: code
      });
      myCodeElement.innerText = code;
    }
  });

  // Handle joining a chat
  document.getElementById("joinChatButton").addEventListener("click", function() {
    console.log("Join chat button clicked!"); // Debugging line
    const enteredCode = friendCodeInput.value.trim();
    if (!enteredCode) return alert("Please enter a valid friend code.");

    const chatRoomRef = database.ref("chatrooms/" + enteredCode);
    chatRoomRef.once("value").then(function(snapshot) {
      if (snapshot.exists()) {
        if (snapshot.val().friends.includes(currentUser.uid)) {
          chatBox.classList.remove("hidden");
          messagesDiv.innerHTML = ''; // Clear messages
        } else {
          alert("You can only join if your friend is in the chat.");
        }
      } else {
        alert("Invalid chat room code.");
      }
    });
  });

  // Handle sending messages
  document.getElementById("sendMessageButton").addEventListener("click", function() {
    console.log("Send message button clicked!"); // Debugging line
    const message = messageInput.value.trim();
    if (!message) return;

    const messageData = {
      sender: currentUser.displayName,
      message: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    const chatRoomRef = database.ref("chatrooms/" + friendCodeInput.value);
    chatRoomRef.push(messageData);
    messageInput.value = ''; // Clear input after sending
  });

  // Listen for new messages in the chatroom
  const chatRoomRef = database.ref("chatrooms/");
  chatRoomRef.on("child_added", function(snapshot) {
    const messageData = snapshot.val();
    const messageElement = document.createElement("p");
    messageElement.innerText = `${messageData.sender}: ${messageData.message}`;
    messagesDiv.appendChild(messageElement);
  });
});

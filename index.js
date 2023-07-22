import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  databaseURL:
    "https://family-gossip-default-rtdb.europe-west1.firebasedatabase.app/",
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);
const messageinDB = ref(database, "messages");

const messageForm = document.getElementById("form-message");
messageForm.addEventListener("submit", sendDataToDatabase);

const textareaEl = document.getElementById("message-textarea");
const senderInputEl = document.getElementById("sender-input");
const receiverInputEl = document.getElementById("receiver-input");
const ulEl = document.getElementById("message-ul");

let isLiked = false;

function sendDataToDatabase(e) {
  e.preventDefault();

  const messageData = {
    nameFrom: senderInputEl.value,
    nameTo: receiverInputEl.value,
    message: textareaEl.value,
    countLikes: 0,
  };

  push(messageinDB, messageData);
  messageForm.reset();
}

function getDataFromDatabase() {
  onValue(messageinDB, snapshot);
}

function snapshot(snapshot) {
  const messageExists = snapshot.exists() && snapshot.hasChildren();
  if (messageExists) {
    ulEl.innerHTML = "";
    const messageObj = Object.entries(snapshot.val()).reverse();
    const messages = messageObj.map((message) => {
      const h3From = document.createElement("h3");
      const p1 = document.createElement("p");
      p1.setAttribute("class", "message-text");

      const div1 = document.createElement("div");
      div1.setAttribute("class", "name-like-and-count-section");

      const div2 = document.createElement("div");
      div2.setAttribute("class", "like-and-count-section");

      const i = document.createElement("i");
      isLiked
        ? i.setAttribute("class", "fa-solid fa-heart red")
        : i.setAttribute("class", "fa-solid fa-heart");
      i.setAttribute("id", `${message[0]}`);
      i.addEventListener("click", () => {
        isLiked = !isLiked;
        const likes = isLiked
          ? message[1].countLikes + 1
          : message[1].countLikes - 1;
        const target = ref(database, `messages/${message[0]}`);
        update(target, {
          ...message,
          countLikes: likes,
        });
      });

      const p2 = document.createElement("p");
      p2.setAttribute("class", "count-likes");
      p2.textContent = message[1].countLikes;
      div2.append(i, p2);

      const h3To = document.createElement("h3");
      div1.append(h3To, div2);

      const li = document.createElement("li");
      h3From.textContent = `From ${message[1].nameFrom}`;
      h3To.textContent = `To ${message[1].nameTo}`;
      p1.textContent = message[1].message;
      li.append(h3From, p1, div1);

      return li;
    });
    ulEl.append(...messages);
  } else {
    ulEl.innerHTML = "";
    const h4 = document.createElement("h4");
    h4.setAttribute("class", "empty-message");
    h4.textContent = "There is no gossip here";
    ulEl.append(h4);
  }
}

getDataFromDatabase();

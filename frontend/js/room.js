const btnSend = document.getElementById("send-btn");
const btnCopy = document.getElementById("copy-id-btn");
const userMsg = document.getElementById("user-msg");
const roomId = document.getElementById("room-id");
const messageContainer = document.getElementById("message-container");
const video = document.getElementById("video");
const viewerCount = document.getElementById("viewer-count");

new ClipboardJS("#copy-id-btn", {
	text: function () {
		return roomId.innerText;
	},
});

function displayMessage(type, name, msg) {
	name = name;

	var messageEvent;

	switch (type) {
		case "new-leader":
			msg = msg || "is a new Leader.";
		case "user-join":
			msg = msg || "has joined.";
		case "user-leave":
			msg = msg || "has left.";
			messageEvent = `
                <div class="message information">
                    <div class="name">${name}</div>
                    <div class="content">${msg}</div>
                </div>
            `;
			break;
		case "sender":
		case "receiver":
			messageEvent = `
                <div class="message">
                    <div class="${type} name">${name}</div>
                    <div class="content">${msg}</div>
                </div>
            `;
			break;
	}

	messageContainer.insertAdjacentHTML("beforeend", messageEvent);
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

var cookies = getCookies();

if (cookies.usertype === "member") {
	video.controls = false;
}

btnSend.addEventListener("click", (e) => {
	if (userMsg.value === "") {
		return;
	}

	socket.emit("message", userMsg.value);
	displayMessage("sender", cookies.username, userMsg.value);
	userMsg.value = "";
});

userMsg.addEventListener("keydown", (e) => {
	if (e.key === "Enter") {
		btnSend.dispatchEvent(
			new MouseEvent("click", {
				bubbles: false,
				cancelable: false,
			})
		);
	}
});

const socket = io();

video.addEventListener("click", (e) => {
	e.preventDefault();
});
video.addEventListener("play", (e) => {
	if (video.readyState == 4) socket.emit("play", cookies.roomId, cookies.usertype);
});

video.addEventListener("pause", (e) => {
	if (video.readyState == 4) socket.emit("pause", cookies.roomId, cookies.usertype);
});

video.addEventListener("seeked", (e) => {
	socket.emit("seek", video.currentTime);
});

socket.on("connect", () => {
	const count = parseInt(viewerCount.innerHTML);

	viewerCount.innerHTML = count + 1;
	socket.emit("user-join", cookies.roomid, cookies.userid);
});

socket.on("play", () => {
	if (video.paused) video.play();
});

socket.on("pause", () => {
	if (!video.paused) video.pause();
});

socket.on("seek", (time) => {
	video.currentTime = time + 0.5;
});

socket.on("user-join", (username) => {
	const count = parseInt(viewerCount.innerHTML);
	viewerCount.innerHTML = count + 1;
	displayMessage("user-join", username);
});

socket.on("message", (name, msg) => {
	console.log("message");
	displayMessage("receiver", name, msg);
});

socket.on("time-req", (uid, lid) => {
	console.log("time-req");
	if (cookies.userid === lid) socket.emit("time-res", video.paused, video.currentTime, uid);
});

socket.on("new-leader", (username, uid) => {
	if (cookies.userid === uid) {
		video.controls = true;
		displayMessage("new-leader", "You", "are a new Leader.");
		socket.emit("leader-confirm");
	} else {
		displayMessage("new-leader", username);
	}
});

socket.on("time-res", (isPaused, time, uid) => {
	if (cookies.userid == uid) {
		video.currentTime = time + 0.75;
		if (!isPaused) video.play();
	}
});

socket.on("user-leave", (username) => {
	console.log("user-leave");
	const count = parseInt(viewerCount.innerHTML);
	viewerCount.innerHTML = count - 1;
	displayMessage("user-leave", username);
});

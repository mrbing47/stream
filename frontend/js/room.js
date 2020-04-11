const btnSend = document.getElementById("send-btn");
const userMsg = document.getElementById("user-msg");
const roomId = document.getElementById("room-id");
const messageContainer = document.getElementById("message-container");

function displayMessage(type, name, msg) {
	name = name;

	var messageEvent;

	switch (type) {
		case "create-room":
			msg = msg || "have created this room";
		case "user-join":
			msg = msg || "has joined.";
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

const socket = io();

const cookies = getCookies();

btnSend.addEventListener("click", (e) => {
	if (userMsg.value === "") {
		return;
	}

	console.log(cookies);

	socket.emit("new-msg", roomId.id, userMsg.value);
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

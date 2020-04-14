const username = document.getElementById("username");
const roomname = document.getElementById("roomname");

const btnJoin = document.getElementById("join-btn");
const btnCreate = document.getElementById("create-btn");
const btnPersonal = document.getElementById("watch-personal");

const snackbar = document.getElementById("snackbar");
const snacktext = document.getElementById("snacktext");

let snackbarInterval = 0;

function showSnackState(msg) {
	msg = msg || "Enter all details.";

	if (snackbarInterval == 0) {
		snacktext.innerText = msg;

		snackbar.style.bottom = "5%";
		snackbar.style.visibility = "visible";
		snackbar.style.opacity = "1";

		snackbarInterval = setTimeout(() => {
			snackbar.style.bottom = "-40px";
			snackbar.style.visibility = "hidden";
			snackbar.style.opacity = "0";
			snackbarInterval = 0;
		}, 2000);
	}
}

function makeServerCall(usertype) {
	deleteCookie("watchmode");

	const uName = username.value.trim();
	const rName = roomname.value.trim();

	if (uName === "" || rName === "") {
		showSnackState();
		return;
	}

	if (usertype === "leader")
		if (rName.length > 18) {
			showSnackState("Max. 18 characters in Room name.");
			return;
		}

	fetch("/login", {
		method: "post",
		body: JSON.stringify({
			room: rName,
			usertype: usertype,
			username: uName,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	})
		.then((res) => res.json())
		.then((data) => {
			console.log(data);
			if (data.err) {
				showSnackState(data.err);
			} else {
				window.location.href = new URL(data.src, window.location.origin).href;
			}
		})
		.catch((err) => console.log(err));
}

btnJoin.addEventListener("click", (e) => {
	e.preventDefault();
	makeServerCall("member");
});

btnCreate.addEventListener("click", (e) => {
	e.preventDefault();
	makeServerCall("leader");
});

btnPersonal.addEventListener("click", (e) => {
	setCookie("watchmode", "personal");
});

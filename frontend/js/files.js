const videoCards = document.getElementsByClassName("video-card");
const container = document.getElementsByClassName("video-container");
const menuOptions = document.getElementsByClassName("options");
const selectedOption = document.getElementById("selected");

const urlParams = new URLSearchParams(window.location.search);
const sortMethod = urlParams.get("sort");
if (sortMethod) {
	if (sortMethod === "alpha") selectedOption.innerText = menuOptions[0].innerHTML;
	if (sortMethod === "latest") selectedOption.innerText = menuOptions[1].innerHTML;
	if (sortMethod === "oldest") selectedOption.innerText = menuOptions[2].innerHTML;
} else selectedOption.innerText = menuOptions[0].innerHTML;

console.log(menuOptions[0].innerHTML);

const cookies = getCookies();

for (const option of menuOptions) {
	option.addEventListener("click", (e) => {
		if (selectedOption.innerText !== option.innerText) {
			const urlParams = new URLSearchParams(window.location.search);

			urlParams.set("sort", option.id);

			const redirectedUrl = new URL(window.location.href);
			redirectedUrl.search = urlParams;

			window.location.href = redirectedUrl.href;
		}
	});
}

for (const card of videoCards) {
	card.addEventListener("click", (event) => {
		const cardType = card.classList[1];

		const url = new URL("/" + card.classList[1], window.location.origin);

		url.search = new URLSearchParams({
			path: container[0].id,
			folder: card.id,
		});

		if (cardType === "file") {
			setCookie("video", {
				title: card.querySelector(".video-title").innerText.trim(),
				size: card.querySelector(".video-size").innerText.trim(),
				time: card.querySelector(".video-duration").innerText.trim(),
			});
		}

		window.location.href = url.href;
	});
}

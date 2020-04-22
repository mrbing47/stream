const videoCards = document.getElementsByClassName("video-card");
const container = document.getElementsByClassName("video-container");

const cookies = getCookies();

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

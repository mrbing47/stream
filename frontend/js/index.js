const videoCards = document.getElementsByClassName("video-card");
const container = document.getElementsByClassName("video-container");

for (const card of videoCards) {
	card.addEventListener("click", event => {
		const url = new URL("/" + card.classList[1], window.location.origin);

		url.search = new URLSearchParams({
			path: container[0].id,
			folder: card.id
		});

		window.location.href = url.href;
	});
}

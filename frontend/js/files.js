const videoCards = document.getElementsByClassName("video-card");
const container = document.getElementsByClassName("video-container");
const menu = document.getElementById("menu");
const menuOptions = document.getElementsByClassName("options");
const selectedOption = document.getElementById("selected");
const queryInput = document.getElementById("query");
const submitQuery = document.getElementById("search");

const urlParams = new URLSearchParams(window.location.search);

if (window.location.pathname == "/search") {
	menu.insertAdjacentHTML(
		"beforeend",
		'<div class="options" id="relevant">Relevant</div>'
	);
	const queryString = urlParams.get("q");
	queryInput.value = queryString.replaceAll("%26", "&").trim();
}

const sortMethod = urlParams.get("sort");
if (sortMethod) {
	if (sortMethod === "alpha")
		selectedOption.innerText = menuOptions[0].innerHTML;
	if (sortMethod === "latest")
		selectedOption.innerText = menuOptions[1].innerHTML;
	if (sortMethod === "oldest")
		selectedOption.innerText = menuOptions[2].innerHTML;
	if (sortMethod === "relevant")
		selectedOption.innerText = menuOptions[3].innerHTML;
} else {
	if (window.location.pathname == "/search")
		selectedOption.innerText = menuOptions[3].innerHTML;
	else selectedOption.innerText = menuOptions[0].innerHTML;
}

console.log(menuOptions[0].innerHTML);

const cookies = getCookies();

for (const option of menuOptions) {
	option.addEventListener("click", (e) => {
		if (selectedOption.innerText !== option.innerText) {
			urlParams.set("sort", option.id);

			const redirectedUrl = new URL(window.location.href);
			redirectedUrl.search = urlParams;

			window.location.href = redirectedUrl.href;
		}
	});
}

submitQuery.addEventListener("click", () => {
	const query = queryInput.value.replaceAll("&", "%26").trim();
	const redirectedUrl = new URL(window.location.origin);

	if (query == "") {
		redirectedUrl.pathname = "/folder";
		console.error("Empty String, redirecting to root");
	} else {
		redirectedUrl.search = new URLSearchParams({ q: query });
		redirectedUrl.pathname = "/search";
	}
	console.log(redirectedUrl.href);
	window.location.href = redirectedUrl.href;
});

for (const card of videoCards) {
	card.addEventListener("click", (event) => {
		const cardType = card.classList[1];

		const url = new URL(
			"/" + card.classList[1],
			window.location.origin
		);
		const currUrlParams = new URLSearchParams(
			window.location.search
		);
		const newUrlParams = new URLSearchParams({
			path: container[0].id,
			folder: card.id,
		});

		if (currUrlParams.get("sort"))
			newUrlParams.set("sort", currUrlParams.get("sort"));

		url.search = newUrlParams;

		if (cardType === "file") {
			setCookie("video", {
				title: card
					.querySelector(".video-title")
					.innerText.trim(),
				size: card
					.querySelector(".video-size")
					.innerText.trim(),
				time: card
					.querySelector(".video-duration")
					.innerText.trim(),
			});
		}

		window.location.href = url.href;
	});
}

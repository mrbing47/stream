const videoCards = document.getElementsByClassName("video-card");
const container = document.getElementsByClassName("video-container");
const menu = document.getElementById("menu");
const menuOptions = document.getElementsByClassName("options");
const filterOptions = document.getElementsByClassName("filter-options");
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
		selectedOption.innerText = menuOptions[0].innerHTML.trim();
	if (sortMethod === "latest")
		selectedOption.innerText = menuOptions[1].innerHTML.trim();
	if (sortMethod === "oldest")
		selectedOption.innerText = menuOptions[2].innerHTML.trim();
	if (sortMethod === "relevant")
		selectedOption.innerText = menuOptions[3].innerHTML.trim();
} else {
	if (window.location.pathname == "/search")
		selectedOption.innerText = menuOptions[3].innerHTML.trim();
	else selectedOption.innerText = menuOptions[0].innerHTML.trim();
}
console.log(menuOptions[0].innerHTML);

let filterTypes = new Set();
if (urlParams.get("filter"))
	filterTypes = new Set(
		urlParams
			.get("filter")
			.split(",")
			.map((e) => parseInt(e))
			.filter((e) => !isNaN(e))
	);
if (filterTypes.size > 0)
	for (let type of filterTypes)
		filterOptions[type].classList.add("filter-selected");

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

for (const option of filterOptions) {
	option.addEventListener("click", (e) => {
		let filters = new Set();
		if (urlParams.get("filter"))
			filters = new Set(
				urlParams
					.get("filter")
					.split(",")
					.map((e) => parseInt(e))
					.filter((e) => !isNaN(e))
			);

		const elementType = parseInt(e.target.dataset.id);
		if (filters.has(elementType)) filters.delete(elementType);
		else filters.add(elementType);

		console.log({ filters: [...filters], elementType });
		if (filters.size === 0) urlParams.delete("filter");
		else urlParams.set("filter", [...filters].join());

		const redirectedUrl = new URL(window.location.href);
		redirectedUrl.search = urlParams;

		window.location.href = redirectedUrl.href;
	});
}

queryInput.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		submitQuery.dispatchEvent(
			new MouseEvent("click", {
				bubbles: false,
				cancelable: false,
			})
		);
	}
});

submitQuery.addEventListener("click", () => {
	const query = queryInput.value.replaceAll("&", "%26").trim();
	const redirectedUrl = new URL(window.location.origin);

	if (query == "") {
		redirectedUrl.pathname = "/folder";
		console.error("Empty String, redirecting to root");
	} else {
		const redirectParams = new URLSearchParams({ q: query });
		if (urlParams.get("filter"))
			redirectParams.append("filter", urlParams.get("filter"));

		redirectedUrl.search = redirectParams;
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
		// console.log(card.dataset);
		const newUrlParams = new URLSearchParams({
			path: card.dataset.filePath,
			folder: card.id,
		});

		if (currUrlParams.get("sort"))
			newUrlParams.set("sort", currUrlParams.get("sort"));

		url.search = newUrlParams;

		if (cardType === "file") {
			if (card.dataset.fileType === 1)
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

		// console.log(url.href);
		window.location.href = url.href;
	});
}

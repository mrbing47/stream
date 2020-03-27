const folderCards = document.getElementsByClassName("folder");
const fileCards = document.getElementsByClassName("file");

for (const card of folderCards) {
	card.addEventListener("click", event => {
		fetch("/folder/" + card.id, {
			method: "POST"
		});
	});
}

for (const card of fileCards) {
	card.addEventListener("click", event => {
		fetch("/video");
		console.log(document.cookie);
	});
}

function getCookies() {
	var cookies = document.cookie.split(";");

	var result = {};

	for (var i of cookies) {
		var cookie = i.trim().split("=");

		result[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
	}

	return result;
}

function setCookie(key, value) {
	if (!key || !value) {
		throw new Error("need both key and value");
	}

	if (typeof key !== "string" || typeof value !== "string") {
		throw new Error("key and value must be of string type");
	}

	const cookie = key + "=" + value;
	console.log(cookie);
	document.cookie = cookie;

	return document.cookie;
}

function deleteCookie(key) {
	if (key && typeof key === "string") {
		const cookies = getCookies();

		for (cookie in cookies) {
			if (key === cookie) {
				document.cookie = cookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
				break;
			}
		}
	} else {
		throw new Error("Key must be in correct format and type.");
	}
}

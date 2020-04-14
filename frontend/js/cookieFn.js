function getCookies() {
	var cookies = document.cookie.split(";");

	var result = {};

	for (var i of cookies) {
		var cookie = i.trim().split("=");

		try {
			const jsonCookie = JSON.parse(decodeURIComponent(cookie[1]));
			result[decodeURIComponent(cookie[0])] = jsonCookie;
		} catch (err) {
			result[decodeURIComponent(cookie[0])] = decodeURIComponent(cookie[1]);
		}
	}

	return result;
}

function setCookie(key, value) {
	if (!key || !value) {
		throw new Error("need both key and value");
	}

	if (typeof key !== "string" || (typeof value !== "string" && typeof value !== "object")) {
		throw new Error("key must be of string and value must be of string or object type");
	}

	if (typeof value === "string") {
		const cookie = key + "=" + value;
		document.cookie = cookie;
	} else {
		const newValue = JSON.stringify(value);
		const cookie = key + "=" + newValue;
		document.cookie = cookie;
	}
	return document.cookie;
}

function deleteCookie(key) {
	if (key && (typeof key === "string" || Array.isArray(key))) {
		const cookies = getCookies();

		if (Array.isArray(key)) {
			for (cookie in cookies) {
				const includ = key.includes(cookie);
				console.log(includ);
				if (includ) document.cookie = cookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
			}
		} else {
			for (cookie in cookies) {
				if (key === cookie) {
					document.cookie = cookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
					break;
				}
			}
		}
	} else {
		throw new Error("Key must be in correct format and type.");
	}
}

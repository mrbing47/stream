// const path = require("path");
// require("dotenv").config({
// 	path: path.join(__dirname, "../.env"),
// });
// const CryptoJS = require("crypto-js");
const { networkInterfaces } = require("os");

// function encryptPath(path) {
// 	return CryptoJS.AES.encrypt(path, process.env.SECRET_KEY, {
// 		iv: process.env.SECRET_KEY,
// 		mode: CryptoJS.mode.CBC,
// 		padding: CryptoJS.pad.Pkcs7,
// 	}).toString();
// }

// function decryptPath(path) {
// 	return CryptoJS.AES.decrypt(path, process.env.SECRET_KEY, {
// 		iv: process.env.SECRET_KEY,
// 	}).toString(CryptoJS.enc.Utf8);
// }

function round(num = 0) {
	return Math.round((num + Number.EPSILON) * 100) / 100;
}

function fileSize(size = 0) {
	const sizes = ["KB", "MB", "GB"];
	let currSize = size;
	for (let i = 0; i < sizes.length; i++) {
		currSize = round(currSize / 1024);
		if (currSize < 1024 || i === sizes.length - 1)
			return currSize + ` ${sizes[i]}`;
	}
}

function getIP() {
	const nets = networkInterfaces();
	const results = Object.create(null); // or just '{}', an empty object

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			// skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
			if (net.family === "IPv4" && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}

				results[name].push(net.address);
			}
		}
	}

	return results;
}

function openBrowser(PORT) {
	var url = "http://localhost:" + PORT;
	var start =
		process.platform == "darwin"
			? "open"
			: process.platform == "win32"
			? "start"
			: "xdg-open";
	require("child_process").exec(start + " " + url);
}

module.exports = {
	// updateDetails,
	// encryptPath,
	// decryptPath,
	// iterateDir,
	getIP,
	openBrowser,
	fileSize,
};

const { networkInterfaces } = require("os");

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
	const results = {};

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

function openBrowser(url) {
	var start =
		process.platform == "darwin"
			? "open"
			: process.platform == "win32"
			? "start"
			: "xdg-open";
	require("child_process").exec(start + " " + url);
}

module.exports = {
	getIP,
	openBrowser,
	fileSize,
};

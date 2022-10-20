const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const chalk = require("chalk");
const Store = require("./search/index");
let store;
const dotenv = require("dotenv").config({
	path: path.join(__dirname, "../.env"),
});
const expand = require("dotenv-expand");
expand(dotenv);

const jsonPath = process.env.JSON_PATH.toString().trim();
const dataFile = process.env.DATA_FILE.toString().trim();
const tokensFile = process.env.TOKENS_FILE.toString().trim();
const tnPath = process.env.TN;

const ffprobe = require("ffprobe-client");
const FFmpeg = require("fluent-ffmpeg");

const CryptoJS = require("crypto-js");

const { networkInterfaces } = require("os");

const supportedExt = ["mp4", "mkv", "m4v", "avi", "vtt"];
const ignoreFiles = ["tn", "details"];

var isTn = true;

async function getFiles(folderPath, copyJson) {
	var newEntry = false;

	try {
		const files = await fsp.readdir(folderPath);

		for (const i in files) {
			if (
				ignoreFiles.some((filename) => {
					return (
						filename.localeCompare(files[i], "en", {
							sensitivity: "base",
						}) == 0
					);
				})
			) {
				continue;
			}

			const filePath = path.join(folderPath, files[i]);

			try {
				const fileStats = await fsp.stat(filePath);

				const fileIx = copyJson.findIndex((e) => {
					if (e) {
						if (e.type === "folder")
							return e.title === files[i];
						else
							return (
								e.title + "." + e.extension === files[i]
							);
					}
				});

				if (fileStats.isDirectory()) {
					if (fileIx == -1) {
						console.log(
							"\n\nFOLDER => " +
								chalk.yellow.bold(files[i])
						);
						const { filesInside } = await getFiles(
							filePath,
							[]
						);

						if (filesInside.length != 0) {
							const folderDate = new Date(
								fileStats.birthtimeMs
							)
								.toDateString()
								.split(" ");
							const folderDetails = {
								type: "folder",
								title: files[i],
								birthtime: fileStats.birthtimeMs,
								date:
									folderDate[2] +
									" " +
									folderDate[1] +
									" " +
									folderDate[3],
								path: folderPath,
								files: filesInside,
							};

							newEntry = true;
							copyJson.push(folderDetails);
						}
					} else {
						const { filesInside, hasChanged } =
							await getFiles(
								filePath,
								copyJson[fileIx].files
							);

						if (hasChanged) {
							copyJson[fileIx].files = filesInside.sort(
								(a, b) =>
									a.title.localeCompare(
										b.title,
										"en",
										{
											sensitivity: "base",
										}
									)
							);
							newEntry = hasChanged;
						}
					}
				}
				if (fileStats.isFile()) {
					if (fileIx == -1) {
						const fileParts = files[i].split(".");
						const fileTitle = [
							...fileParts.slice(0, -1),
						].join(".");
						const fileExt = fileParts.slice(-1)[0];

						if (
							supportedExt.some((ext) => {
								return (
									ext.localeCompare(fileExt, "en", {
										sensitivity: "base",
									}) == 0
								);
							})
						) {
							console.log(
								"FILE => " + chalk.green.bold(files[i])
							);
							try {
								const video = await ffprobe(filePath);

								const videoMins =
									"" +
									parseInt(
										parseInt(
											video.format.duration
										) / 60
									);
								var videoSec =
									parseInt(video.format.duration) %
									60;
								if (videoSec < 10) {
									videoSec = "0" + videoSec;
								}

								const fileDate = new Date(
									fileStats.birthtimeMs
								)
									.toDateString()
									.split(" ");
								var videoDetails = {
									type: "file",
									title: fileTitle,
									extension: fileExt,
									duration:
										videoMins + ":" + videoSec,
									size: parseInt(
										parseInt(video.format.size) /
											(1024 * 1024)
									),
									birthtime: fileStats.birthtimeMs,
									date:
										fileDate[2] +
										" " +
										fileDate[1] +
										" " +
										fileDate[3],
									tn: isTn,
									path: folderPath,
								};

								if (isTn) {
									if (
										!fs.existsSync(
											path.join(
												tnPath,
												fileTitle + ".png"
											)
										)
									)
										new FFmpeg(filePath).screenshot(
											{
												timemarks: ["20%"],
												filename: "%b",
												folder: tnPath,
											}
										);
								}
								newEntry = true;

								copyJson.push(videoDetails);
							} catch (err) {
								console.log(err);
							}
						} else {
							console.log(
								"FILE => " + chalk.red.bold(files[i])
							);
						}
					}
				}
			} catch (err) {
				console.log(err);
			}
		}
	} catch (err) {
		console.log(err);
	}

	return { filesInside: copyJson, hasChanged: newEntry };
}

function flattenArr(arr) {
	let res = [];
	for (let i of arr) {
		if (i.type === "file") {
			res.push(i);
		} else {
			let { files, ...obj } = i;
			res.push({ ...obj });
			res = [...res, ...flattenArr(i.files)];
		}
	}
	return res;
}

async function updateDetails() {
	console.log(process.env.ROOT);

	if (!fs.existsSync(jsonPath))
		fs.mkdirSync(jsonPath, (err) => {
			throw err;
		});
	if (!fs.existsSync(tnPath)) isTn = false;

	let json = [];
	let inputJson = "";

	if (fs.existsSync(dataFile)) {
		inputJson = await fsp.readFile(dataFile);
		try {
			json = JSON.parse(inputJson);
		} catch (err) {
			console.log(err);
		}
	}

	let tokens = {};
	if (fs.existsSync(tokensFile)) {
		try {
			let inputTokens = await fsp.readFile(tokensFile);
			tokens = JSON.parse(inputTokens);
			store = new Store({ cb: (ele) => ele.title, tokens });
		} catch (err) {
			console.log(err);
		}
	}

	const data = await getFiles(process.env.ROOT, json);
	const updatedJson = JSON.stringify(data.filesInside);

	let output = data.filesInside;

	if (inputJson != updatedJson) {
		output = output.sort((a, b) =>
			a.title.localeCompare(b.title, "en", {
				sensitivity: "base",
			})
		);

		fs.writeFile(dataFile, JSON.stringify(output), (err) => {
			if (err) console.log(err);
			else console.log("DATA Write was successfull.");
		});
		flatarr = flattenArr(output);
		store = new Store({ cb: (ele) => ele.title });
		store.tokenize(flatarr);
		fs.writeFile(
			tokensFile,
			JSON.stringify(store.tokens),
			(err) => {
				if (err) console.log(err);
				else console.log("TOKENS Write was successfull.");
			}
		);
	} else {
		console.log("No Updates!!");
	}

	return [output, store];
}

function encryptPath(path) {
	return CryptoJS.AES.encrypt(path, process.env.SECRET_KEY, {
		iv: process.env.SECRET_KEY,
		mode: CryptoJS.mode.CBC,
		padding: CryptoJS.pad.Pkcs7,
	}).toString();
}

function decryptPath(path) {
	return CryptoJS.AES.decrypt(path, process.env.SECRET_KEY, {
		iv: process.env.SECRET_KEY,
	}).toString(CryptoJS.enc.Utf8);
}

function iterateDir(videoDetails, pathReq, fileExt) {
	fileExt = fileExt || "";
	const pathArr =
		pathReq.split("\\").length == 1
			? pathReq.split("/")
			: pathReq.split("\\");
	var currFolder = videoDetails;

	for (var ix = 1; ix < pathArr.length; ix++) {
		const fileObj = currFolder.find(
			(e) =>
				e.title === pathArr[ix] &&
				(e.extension ? e.extension === fileExt : true)
		);

		if (!fileObj) return 404;

		if (fileObj.files) currFolder = fileObj.files;
		else {
			currFolder = fileObj;
			break;
		}
	}

	return currFolder;
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
	updateDetails,
	encryptPath,
	decryptPath,
	iterateDir,
	getIP,
	openBrowser,
};

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const dotenv = require("dotenv").config({ path: path.join(__dirname, "../.env") });
const expand = require("dotenv-expand");
expand(dotenv);

const jsonPath = process.env.JSON_PATH.toString().trim();
const jsonFile = process.env.JSON_FILE.toString().trim();
const tnPath = process.env.TN;

const ffprobe = require("ffprobe-client");
const FFmpeg = require("fluent-ffmpeg");

const CryptoJS = require("crypto-js");

const supportedExt = ["mp4", "mkv", "m4v", "avi"];

var isTn = true;

async function getFiles(folderPath, copyJson) {
	var newEntry = false;

	try {
		const files = await fsp.readdir(folderPath);

		for (const i in files) {
			const filePath = path.join(folderPath, files[i]);

			try {
				const fileStats = await fsp.stat(filePath);

				const fileIx = copyJson.findIndex((e) => {
					if (e) {
						if (e.type === "folder") return e.title === files[i];
						else return e.title + "." + e.extension === files[i];
					}
				});

				if (fileStats.isDirectory()) {
					if (fileIx == -1) {
						console.log("FOLDER => " + files[i]);
						const { filesInside } = await getFiles(filePath, []);

						if (filesInside.length != 0) {
							const folderDate = new Date(fileStats.birthtimeMs).toDateString().split(" ");
							const folderDetails = {
								type: "folder",
								title: files[i],
								birthtime: fileStats.birthtimeMs,
								date: folderDate[2] + " " + folderDate[1] + " " + folderDate[3],
								path: folderPath,
								files: filesInside,
							};

							newEntry = true;
							copyJson.push(folderDetails);
						}
					} else {
						const { filesInside, hasChanged } = await getFiles(filePath, copyJson[fileIx].files);

						if (hasChanged) {
							copyJson[fileIx].files = filesInside.sort((a, b) =>
								a.title.localeCompare(b.title, "en", {
									sensitivity: "base",
								})
							);
							newEntry = hasChanged;
						}
					}
				}
				if (fileStats.isFile()) {
					if (fileIx == -1) {
						const fileParts = files[i].split(".");
						const fileTitle = [...fileParts.slice(0, -1)].join(".");
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
							console.log("FILE => " + files[i]);
							try {
								const video = await ffprobe(filePath);

								const videoMins = "" + parseInt(parseInt(video.format.duration) / 60);
								var videoSec = parseInt(video.format.duration) % 60;
								if (videoSec < 10) {
									videoSec = "0" + videoSec;
								}

								const fileDate = new Date(fileStats.birthtimeMs).toDateString().split(" ");
								var videoDetails = {
									type: "file",
									title: fileTitle,
									extension: fileExt,
									duration: videoMins + ":" + videoSec,
									size: parseInt(parseInt(video.format.size) / (1024 * 1024)),
									birthtime: fileStats.birthtimeMs,
									date: fileDate[2] + " " + fileDate[1] + " " + fileDate[3],
									tn: isTn,
									path: folderPath,
								};

								if (isTn) {
									if (!fs.existsSync(path.join(tnPath, fileTitle + ".png")))
										new FFmpeg(filePath).screenshot({
											timemarks: ["20%"],
											filename: "%b",
											folder: tnPath,
										});
								}
								newEntry = true;

								copyJson.push(videoDetails);
							} catch (err) {
								console.log(err);
							}
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

async function updateDetails() {
	if (!fs.existsSync(jsonPath))
		fs.mkdirSync(jsonPath, (err) => {
			throw err;
		});
	if (!fs.existsSync(tnPath)) isTn = false;

	var json = [];
	var inputJson = "";
	if (fs.existsSync(jsonFile)) {
		inputJson = await fsp.readFile(jsonFile);
		try {
			json = JSON.parse(inputJson);
		} catch (err) {
			console.log(err);
		}
	}

	const data = await getFiles(process.env.ROOT, json);
	const updatedJson = JSON.stringify(data.filesInside);

	var output = data.filesInside;

	if (inputJson != updatedJson) {
		output = output.sort((a, b) =>
			a.title.localeCompare(b.title, "en", {
				sensitivity: "base",
			})
		);

		fs.writeFile(jsonFile, JSON.stringify(output), (err) => {
			if (err) console.log(err);
			else console.log("Write was successful");
		});
	} else {
		console.log("No Updates!!");
	}

	return output;
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
	const pathArr = pathReq.split("\\").length == 1 ? pathReq.split("/") : pathReq.split("\\");
	var currFolder = videoDetails;

	for (var ix = 1; ix < pathArr.length; ix++) {
		const fileObj = currFolder.find((e) => e.title === pathArr[ix] && (e.extension ? e.extension === fileExt : true));

		if (!fileObj) return 404;

		if (fileObj.files) currFolder = fileObj.files;
		else {
			currFolder = fileObj;
			break;
		}
	}

	return currFolder;
}

module.exports = {
	updateDetails,
	encryptPath,
	decryptPath,
	iterateDir,
};

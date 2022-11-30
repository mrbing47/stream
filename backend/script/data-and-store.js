const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const { difference, intersection } = require("./setop");
const { File, Configuration } = require("../config");
const ffprobe = require("ffprobe");
const ffprobeStatic = require("ffprobe-static");
const ffmpeg = require("fluent-ffmpeg");
const sharp = require("sharp");
const Store = require("./store/index");

function getFileExtention(filename) {
	let ext = filename.trim().split(".");
	if (ext.length === 1) return;
	ext = ext.slice(-1)[0];
	return ext === "" ? undefined : ext;
}

class FileType {
	static FOLDER = 0;
	static VIDEO = 1;
	static AUDIO = 2;
	static IMAGE = 3;
	static CURRENT = 4;
	static IGNORE = 5;
	static DELETE = 6;
}

function secondsToTime(e) {
	const h = Math.floor(e / 3600)
			.toString()
			.padStart(2, "0"),
		m = Math.floor((e % 3600) / 60)
			.toString()
			.padStart(2, "0"),
		s = Math.floor(e % 60)
			.toString()
			.padStart(2, "0");

	return `${h}:${m}:${s}`;
}

function logFile(filename = "", type = -1, level = 1) {
	if (Configuration._saved[Configuration._options.SILENT]) return;
	let prefix = "";
	let color = (e) => e;
	if (type === FileType.CURRENT) {
		prefix = ["-".repeat(level), "*"];
		color = chalk.yellow;
	} else {
		prefix = [" ".repeat(level), "|-"];
		if (type === FileType.FOLDER) color = chalk.whiteBright;
		if (type === FileType.VIDEO) color = chalk.magenta;
		if (type === FileType.AUDIO) color = chalk.cyan;
		if (type === FileType.IMAGE) color = chalk.green;
		if (type === FileType.IGNORE) color = chalk.grey;
		if (type === FileType.DELETE) color = chalk.red;
	}

	console.log(color(...prefix, filename));
}

function deleteFiles(root, filesToDelete = [], level = 1) {
	// console.log({ filesToDelete });
	for (let file in filesToDelete) {
		fs.rmSync(
			path.join(File.TN, root, path.parse(file).name) +
				`-${filesToDelete[file].type}.png`,
			{
				recursive: true,
				force: true,
			}
		);
		logFile(file, FileType.DELETE, level);
	}
}

function consoleIgnoreFiles(filesToIgnore = [], level = 1) {
	for (let file of filesToIgnore)
		logFile(file, FileType.IGNORE, level);
}

async function scanFiles(root, filesToScan = [], level = 1) {
	const res = {
		folders: {},
		files: {},
	};

	// console.log({ filesToScan });

	for (let name of filesToScan) {
		const filePath = path.join(File.ROOT, root, name);
		const fileStats = fs.statSync(filePath);
		if (fileStats.isDirectory()) {
			logFile(name, FileType.FOLDER, level);
			res.folders[name] = {
				type: FileType.FOLDER,
				birthtime: fileStats.birthtimeMs,
				path: root,
			};
		} else {
			if (fileStats.isFile()) {
				const fileExtension = getFileExtention(name);
				let fileType = "";
				if (
					Configuration._saved[
						Configuration._options.VIDEO_EXT
					].includes(fileExtension)
				)
					fileType = FileType.VIDEO;
				if (
					Configuration._saved[
						Configuration._options.AUDIO_EXT
					].includes(fileExtension)
				)
					fileType = FileType.AUDIO;
				if (
					Configuration._saved[
						Configuration._options.IMAGE_EXT
					].includes(fileExtension)
				)
					fileType = FileType.IMAGE;

				// console.log({ fileType });
				if (
					fileType === FileType.VIDEO ||
					fileType === FileType.AUDIO ||
					fileType === FileType.IMAGE
				) {
					logFile(name, fileType, level);
					let details = {};

					const contentInfo = (
						await ffprobe(filePath, {
							path: ffprobeStatic.path,
						})
					).streams[0];

					if (
						fileType === FileType.VIDEO ||
						fileType === FileType.AUDIO
					) {
						const contentDuration = secondsToTime(
							parseInt(contentInfo.duration)
						);
						details.duration = contentDuration;
					}
					if (
						fileType === FileType.VIDEO ||
						fileType === FileType.IMAGE
					) {
						const videoDimensions = `${contentInfo.width}x${contentInfo.height}`;
						details.dimensions = videoDimensions;

						const tnPath = path.join(File.TN, root);
						try {
							fs.accessSync(tnPath);
						} catch (e) {
							fs.mkdirSync(tnPath, {
								recursive: true,
							});
						}

						if (fileType === FileType.VIDEO)
							ffmpeg(filePath).screenshots({
								timestamps: ["20%"],
								filename: `%b-${fileType}.png`,
								folder: tnPath,
							});
						if (fileType === FileType.IMAGE)
							sharp(filePath)
								.resize({
									height: 300,
									fit: sharp.fit.cover,
								})
								.toFile(
									path.join(
										tnPath,
										path.parse(name).name +
											`-${fileType}.png`
									)
								);
					}

					res.files[name] = {
						type: fileType,
						size: fileStats.size,
						birthtime: fileStats.birthtimeMs,
						path: root,
						...details,
					};
				}
			}
		}
	}

	return res;
}

async function iterateFiles(root, existingFiles = {}, level = 0) {
	logFile(path.parse(root).name, FileType.CURRENT, level);

	const files = fs.readdirSync(path.join(File.ROOT, root));

	const combinedFiles = {
		...existingFiles.folders,
		...existingFiles.files,
	};

	const existingFileNames = Object.keys(combinedFiles);
	// console.log({ existingFileNames });
	let isChange = false;
	const filesToDelete = [
		...new Set([
			...difference(existingFileNames, files),
			...intersection(
				existingFileNames,
				Configuration._saved[
					Configuration._options.IGNORE_FILES
				]
			),
		]),
	].reduce((acc, curr) => {
		if (existingFiles.files[curr])
			acc[curr] = existingFiles.files[curr];
		return acc;
	}, {});

	deleteFiles(root, filesToDelete, level);

	const fileToIgnore = intersection(
		Configuration._saved[Configuration._options.IGNORE_FILES],
		files
	);

	consoleIgnoreFiles(fileToIgnore, level);
	// console.log({ filesToDelete });

	const filesToScan = difference(
		difference(
			files,
			Configuration._saved[Configuration._options.IGNORE_FILES]
		),
		existingFileNames
	);

	isChange ||= Object.keys(filesToDelete).length !== 0;
	// console.log({ filesToScan });

	const { files: newFilesScanned, folders: newFoldersScanned } =
		await scanFiles(root, filesToScan, level);

	isChange ||= Object.keys(newFilesScanned).length !== 0;
	// console.log({ root, newFoldersScanned });

	const { files: filesToKeep, folders: foldersToKeep } = intersection(
		difference(
			files,
			Configuration._saved[Configuration._options.IGNORE_FILES]
		),
		existingFileNames
	).reduce(
		(acc, curr) => {
			const container = existingFiles.folders[curr]
				? "folders"
				: "files";
			acc[container][curr] = existingFiles[container][curr];
			return acc;
		},
		{ files: {}, folders: {} }
	);

	// console.log({ filesToKeep, foldersToKeep });

	const foldersToScan = {
		...newFoldersScanned,
		...foldersToKeep,
	};

	const resultFolders = {};

	// console.log({ foldersToScan });

	for (let i in foldersToScan) {
		const [res, tempChange] = await iterateFiles(
			path.join(root, i),
			foldersToScan[i],
			level + 1
		);
		isChange ||= tempChange;
		if (
			Object.keys({ ...res.files, ...res.folders }).length !== 0
		) {
			resultFolders[i] = {
				...foldersToScan[i],
				files: res.files,
				folders: res.folders,
			};
		}
	}

	// console.log({ newExistingFiles });

	return [
		{
			files: {
				...newFilesScanned,
				...filesToKeep,
			},
			folders: resultFolders,
		},
		isChange,
	];
}

function searchFile(existingFiles = {}, filePath = "") {
	const foldersAndFile = path
		.normalize(filePath)
		.split(path.sep)
		.filter((e) => e.trim() !== "");

	// console.log({ foldersAndFile });

	let curr = JSON.parse(JSON.stringify(existingFiles));

	for (let i = 0; i < foldersAndFile.length; i++) {
		// console.log({ folder: foldersAndFile[i], dir: curr });

		if (curr.files?.[foldersAndFile[i]])
			curr = curr.files[foldersAndFile[i]];
		else {
			if (curr.folders?.[foldersAndFile[i]])
				curr = curr.folders[foldersAndFile[i]];
			else return [false, "Invalid File"];
		}
	}
	// console.log({ curr });

	const cleanFolders = {};
	// Removing the unneccessary files and folders from subfolders
	// type = undefined if it is the Root directory
	if (curr.type === FileType.FOLDER || curr.type === undefined) {
		for (let i in curr.folders) {
			const {
				files: _files,
				folders: _folders,
				...folderMetaData
			} = curr.folders[i];
			cleanFolders[i] = folderMetaData;
		}
		return { ...curr.files, ...cleanFolders };
	} else return curr;
}

function flattenObj(obj) {
	let res = {};
	for (let i in obj.folders) {
		const {
			files: _files,
			folders: _folders,
			...folderMetaData
		} = obj.folders[i];

		res = {
			...res,
			...obj.files,
			[i]: {
				...folderMetaData,
			},
			...flattenObj(obj.folders[i]),
		};
	}
	return res;
}
function readData() {
	try {
		return JSON.parse(fs.readFileSync(File.DATA_FILE));
	} catch (e) {
		return { files: {}, folders: {} };
	}
}
function writeData(data) {
	fs.writeFileSync(File.DATA_FILE, JSON.stringify(data));
}

function readTokens() {
	try {
		return JSON.parse(fs.readFileSync(File.TOKENS_FILE));
	} catch (e) {
		return {};
	}
}

function writeTokens(tokens) {
	fs.writeFileSync(File.TOKENS_FILE, JSON.stringify(tokens));
}

async function init() {
	const read_data = readData();
	const read_tokens = readTokens();
	const [new_data, isChange] = await iterateFiles("/", read_data);
	const store = new Store({ text: (e) => e[0], tokens: read_tokens });
	if (isChange) writeData(new_data);

	if (isChange || Object.keys(store.tokens).length === 0) {
		store.tokenize(Object.entries(flattenObj(new_data)));
		writeTokens(store.tokens);
	}
	return [
		(filePath) => searchFile(new_data, filePath),
		store.search.bind(store),
	];
}

module.exports = init;

// process.env.ROOT = process.cwd();
const dotenv = require("dotenv").config();
const { File } = require("./backend/config");
const ch = require("./backend/script/command-line/command_controller");
const fs = require("fs");
function createFolders(folders) {
	for (let folder of folders) {
		try {
			fs.accessSync(folder);
		} catch (e) {
			fs.mkdirSync(folder, { recursive: true });
		}
	}
}

(async () => {
	createFolders([File.TN, File.JSON_PATH]);
	await ch.process(process.argv);
})();

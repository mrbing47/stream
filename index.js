const chalk = require("chalk");
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
	const result = await ch.process(process.argv);
	if (result) console.log(chalk.red(result));
})();

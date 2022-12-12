const chalk = require("chalk");
const ch = require("./backend/script/command-line/command_controller");

(async () => {
	const result = await ch.process(process.argv);
	if (result) console.log(chalk.red(result));
})();

const { CommandHandler, Command } = require("./commands");
const chalk = require("chalk");
const fs = require("fs");
const readlineSync = require("readline-sync");
const readline = require("readline");
const { File, Configuration } = require("../../config");
const server = require("../../server");

class Type {
	static INTEGER = "0123";
	static STRING = "string";
	static BOOLEAN = "y/n";
	static LIST_CSV = "m,n";
	static LIST_SSV = "m n";
}

const updateline = (msg) => {
	readline.moveCursor(process.stdout, 0, -1);
	readline.clearLine(process.stdout);
	readline.cursorTo(process.stdout, 0);
	process.stdout.write(msg);
};

const showprompt = (question) => {
	const error = {};
	while (true) {
		updateline(
			chalk.red("? " + (error.message ?? "")) +
				chalk.bold(question.text + " ")
		);
		let input = readlineSync.question().trim();
		if (input != "") {
			if (question.type == Type.INTEGER) {
				input = parseInt(input);
				if (isNaN(input) || input < 1) {
					error.message = "(> 1 Value Only) ";
					continue;
				}
			}
			if (question.type == Type.BOOLEAN) {
				if (
					input.toLowerCase() !== "y" &&
					input.toLowerCase() !== "n"
				) {
					error.message = "(Ony Y/N) ";
					continue;
				} else input = input.toLowerCase() === "y";
			}
			if (question.type == Type.LIST_CSV)
				input = [
					...new Set(
						input.split(",").map((ele) => ele.trim())
					),
				];
			if (question.type == Type.LIST_SSV) {
				input = [
					...new Set(
						input.split(" ").map((ele) => ele.trim())
					),
				];
			}
		}

		updateline(
			chalk.green("\u2713 ") +
				chalk.bold(question.text) +
				" " +
				input +
				"\n\n"
		);
		return input;
	}
};

class CommandOptions {
	static ALL = ["all", "l"];
	static AUDIO_EXT = [Configuration._options.AUDIO_EXT, "a"];
	static IGNORE_FILES = [Configuration._options.IGNORE_FILES, "f"];
	static IMAGE_EXT = [Configuration._options.IMAGE_EXT, "i"];
	static PORT = [Configuration._options.PORT, "p"];
	static SILENT = ["silent", "s"];
	static TN = [Configuration._options.TN, "t"];
	static VIDEO_EXT = [Configuration._options.VIDEO_EXT, "v"];
	static YES = ["yes", "y"];
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

const init = new Command({
	name: "init",
	short: "i",
	description: "This commands initialises a config file.",
	options: {
		total: Command.OPTIONAL,
		args: [CommandOptions.YES, CommandOptions.SILENT],
	},
	async action(data, options, ch) {
		if (data) {
			try {
				fs.accessSync(data);
				File.ROOT = data;
			} catch (err) {
				return [false, "Invalid Directory"];
			}
		}

		if (!options.args.y) {
			const questions = {
				[Configuration._options.PORT]: {
					text: "Enter a port number (default 4769):",
					type: Type.INTEGER,
				},
				[Configuration._options.IGNORE_FILES]: {
					text: "Add file names (seperated by comma) to ignore (default: stream):",
					type: Type.LIST_CSV,
				},
				[Configuration._options.VIDEO_EXT]: {
					text: "Add video extensions (seperated by space) to read (default: mp4, mkv, m4v, avi, vtt):",
					type: Type.LIST_SSV,
				},
				[Configuration._options.AUDIO_EXT]: {
					text: "Add audio extensions (seperated by space) to read (default: mp3, avi, wav, flac):",
					type: Type.LIST_SSV,
				},
				[Configuration._options.IMAGE_EXT]: {
					text: "Add image extensions (seperated by space) to read (default: jpg, jpeg, png, webp):",
					type: Type.LIST_SSV,
				},
				[Configuration._options.TN]: {
					text: "Do you want to generate Thumbnails for video and images (Y[default]/N):",
					type: Type.BOOLEAN,
				},
			};

			Configuration.reset();
			console.log();
			Object.entries(questions).forEach((ele) => {
				let answer = showprompt(ele[1]);
				if (
					ele[1].type === Type.LIST_CSV ||
					ele[1].type === Type.LIST_SSV
				)
					answer = [
						...Configuration._saved[ele[0]],
						...answer,
					];

				if (answer) Configuration._saved[ele[0]] = answer;
			});
		}

		if (!options.args.s) {
			try {
				fs.accessSync(File.JSON_PATH);
			} catch (err) {
				console.log(
					chalk.bold.cyan(`Creating folder ${File.JSON_PATH}`)
				);
				fs.mkdirSync(File.JSON_PATH, {
					recursive: true,
				});
			}

			console.log(
				chalk.green("Saving following JSON in"),
				File.CONFIG_FILE
			);
			console.log(Configuration._saved);
		}

		Configuration.saveConfig();
		return true;
	},
});

const reset = new Command({
	name: "reset",
	short: "s",
	description: "This commands resets a config option from file.",
	options: {
		total: Command.ATLEAST,
		args: [
			CommandOptions.ALL,
			CommandOptions.PORT,
			CommandOptions.IGNORE_FILES,
			CommandOptions.VIDEO_EXT,
			CommandOptions.AUDIO_EXT,
			CommandOptions.IMAGE_EXT,
			CommandOptions.TN,
			CommandOptions.SILENT,
		],
	},
	async action(data, options, ch) {
		if (data) {
			try {
				fs.accessSync(data);
				File.ROOT = data;
			} catch (err) {
				return [false, "Invalid Directory"];
			}
		}

		if (options.args.l)
			return ch.shorts["i"].action("", {
				args: { y: true, s: true },
			});

		Object.keys(options.args).forEach((ele) => {
			const flag = this.options.args.s2l[ele];
			Configuration._saved[flag] = Configuration._default[flag];
		});

		if (!options.args.s) {
			console.log(
				chalk.green("Saving following JSON in"),
				File.CONFIG_FILE
			);
			console.log(Configuration._saved);
		}

		Configuration.saveConfig();
	},
});

const update = new Command({
	name: "update",
	short: "u",
	description:
		"This commands update a kwargs config option from file.",
	options: {
		total: Command.ATLEAST,
		args: [
			CommandOptions.PORT,
			CommandOptions.IGNORE_FILES,
			CommandOptions.VIDEO_EXT,
			CommandOptions.AUDIO_EXT,
			CommandOptions.IMAGE_EXT,
			CommandOptions.TN,
			CommandOptions.SILENT,
		],
	},
	async action(data, options, ch) {
		if (data) {
			try {
				fs.accessSync(data);
				File.ROOT = data;
			} catch (err) {
				return [false, "Invalid Directory"];
			}
		}

		const questions = {};

		if (options.args.p)
			questions[Configuration._options.PORT] = {
				text: "Enter a port number (default 4769):",
				type: Type.INTEGER,
			};
		if (options.args.f)
			questions[Configuration._options.IGNORE_FILES] = {
				text: "Enter file names (seperated by comma) to ignore:",
				type: Type.LIST_CSV,
			};
		if (options.args.v)
			questions[Configuration._options.VIDEO_EXT] = {
				text: "Enter video extensions (seperated by space) to read:",
				type: Type.LIST_SSV,
			};
		if (options.args.a)
			questions[Configuration._options.AUDIO_EXT] = {
				text: "Enter audio extensions (seperated by space) to read:",
				type: Type.LIST_SSV,
			};
		if (options.args.i)
			questions[Configuration._options.IMAGE_EXT] = {
				text: "Enter image extensions (seperated by space) to read:",
				type: Type.LIST_SSV,
			};
		if (options.args.t)
			questions[Configuration._options.TN] = {
				text: "Do you want to generate Thumbnails for video and images:",
				type: Type.BOOLEAN,
			};

		// console.log({ data, options, questions });
		console.log();
		Object.entries(questions).forEach((ele) => {
			let answer = showprompt(ele[1]);
			if (answer !== "") Configuration._saved[ele[0]] = answer;
			// console.log(ele[0], answer);
		});

		if (!options.args.s) {
			console.log(
				chalk.green("Saving following JSON in"),
				File.CONFIG_FILE
			);
			console.log(Configuration._saved);
		}

		Configuration.saveConfig();
	},
});

const run = new Command({
	name: "run",
	short: "r",
	default: true,
	description: "This commands runs the stream application.",
	options: {
		total: Command.OPTIONAL,
		kwargs: [
			CommandOptions.PORT,
			CommandOptions.IGNORE_FILES,
			CommandOptions.VIDEO_EXT,
			CommandOptions.AUDIO_EXT,
			CommandOptions.IMAGE_EXT,
			CommandOptions.TN,
		],
		args: [CommandOptions.SILENT],
	},
	async action(data, options, ch) {
		if (data) {
			try {
				fs.accessSync(data);
				File.ROOT = data;
			} catch (err) {
				return [false, "Invalid Directory"];
			}
		}

		CommandOptions.VIDEO_EXT[1];
		Object.entries(options.kwargs).forEach((ele) => {
			let input = ele[1];
			if (
				ele[0] === CommandOptions.VIDEO_EXT[1] ||
				ele[0] === CommandOptions.AUDIO_EXT[1] ||
				ele[0] === CommandOptions.IMAGE_EXT[1]
			)
				input = ele[1].split(" ");
			if (ele[0] === CommandOptions.IGNORE_FILES[1])
				input = [
					...Configuration._default.ignore_files,
					...ele[1].split(",").map((e) => e.trim()),
				];
			if (ele[0] === CommandOptions.TN[1])
				input = input.toLowerCase() === "y";

			// console.log(ele, input);

			Configuration._saved[this.options.kwargs.s2l[ele[0]]] =
				input;
		});
		Object.entries(options.args).forEach((ele) => {
			Configuration._saved[this.options.args.s2l[ele[0]]] = true;
		});

		// console.log({ config: Configuration._saved, options });

		await server(Configuration._saved.port);

		// console.log({ data, options });
	},
});

const help = new Command({
	name: "help",
	short: "h",
	description:
		"This commands shows the help menu for the stream application.",
	async action(data, options, ch) {
		if (data) {
			try {
				fs.accessSync(data);
				File.ROOT = data;
			} catch (err) {
				return [false, "Invalid Directory"];
			}
		}

		console.log({ data, options });
	},
});

////////////////////////////////////////////////////////////////////////////////////////////////////////

// (async () => {
// 	let ch = new CommandHandler([init, reset, update, run]);
// 	console.log(
// 		await ch.process(
// 			"init",
// 			"E:TorrentAlgoExpert - Become an Algorithms Expert",
// 			["--yes", "-y"]
// 		)
// 	);
// })();

// console.log(init.options);
// console.log(help.options, run.options);

////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = new CommandHandler([init, reset, update, run, help]);

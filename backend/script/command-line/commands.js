class CommandHandler {
	constructor(commands = []) {
		this.commands = {};
		this.shorts = {};
		this.default = commands.find((ele) => ele.default);
		commands.forEach((ele) => (this.commands[ele.name] = ele));
		commands.forEach((ele) => (this.shorts[ele.short ?? ""] = ele));
	}

	#combine_options(options = []) {
		options.push("-");
		const res = [];
		let temp = [];

		for (let ele of options) {
			if (temp.length == 0 && !ele.startsWith("-"))
				return [false, "Invalid flag: " + ele];

			if (ele.startsWith("-")) {
				if (temp.length > 0) {
					let op = [temp[0]];
					if (temp[1])
						op.push(temp.slice(1).join(" ").trim());
					res.push(op);
				}

				temp = [ele];
			} else temp.push(ele);
		}

		return res;
	}

	async process(argv = [], argstart = 2) {
		// Processing arguments
		let command = "";
		let data = "";
		let options = [];

		// console.log(argv);

		if (argv[argstart]?.startsWith("-"))
			options = argv.slice(argstart);
		else {
			command = argv[argstart] ?? "";
			if (argv[argstart + 1]?.startsWith("-"))
				options = argv.slice(argstart + 1);
			else {
				const opstart = argv.findIndex((ele) =>
					ele.startsWith("-")
				);
				// console.log(opstart, argv.slice(argstart + 1));
				data = argv
					.slice(
						argstart + 1,
						opstart === -1 ? argv.length : opstart
					)
					.join(" ");
				if (opstart !== -1) options = argv.slice(opstart);
			}
		}
		// console.log({ command, data, options });
		options = this.#combine_options(options);

		// Verifying Command and manipulating data accordingly
		let current;
		if (!this.commands[command] && !this.shorts[command]) {
			if (!this.default) return [false, "Invalid Command"];
			else {
				current = this.default;
				data = ((command ?? "") + " " + (data ?? "")).trim();
				command = "";
			}
		} else current = this.commands[command] ?? this.shorts[command];

		// console.log({
		// 	name: current.name,
		// 	short: current.short,
		// 	data,
		// 	options,
		// });
		// Verifying options
		if (
			current.options.total == Command.ATLEAST &&
			options.length == 0
		) {
			return [false, "Command requires atleast 1 option."];
		}

		const modop = options.reduce(
			(prev, curr) => {
				if (!prev.error) {
					let flag = curr[0];

					if (flag.startsWith("---"))
						return {
							error: true,
							message: "Invalid flag format: " + flag,
						};

					if (curr.length > 1) {
						const flagdata = curr[1];

						if (
							(flag.startsWith("--") &&
								!current.options.kwargs.long.includes(
									flag.slice(2)
								)) ||
							(flag.startsWith("-") &&
								!current.options.kwargs.short.includes(
									flag.slice(1)
								))
						)
							return {
								error: true,
								message: "Invalid kwarg: " + flag,
							};

						flag = flag.replace(/^-+|-+$/g, "");
						prev.kwargs[
							current.options.kwargs.l2s[flag] ?? flag
						] = flagdata;
					} else {
						if (
							(flag.startsWith("--") &&
								!current.options.args.long.includes(
									flag.slice(2)
								)) ||
							(flag.startsWith("-") &&
								!current.options.args.short.includes(
									flag.slice(1)
								))
						)
							return {
								error: true,
								message: "Invalid arg: " + flag,
							};

						flag = flag.replace(/^-+|-+$/g, "");
						prev.args[
							current.options.args.l2s[flag] ?? flag
						] = true;
					}
				}
				return prev;
			},
			{
				kwargs: {},
				args: {},
			}
		);

		if (modop.error) return [false, modop.message];

		const self = this;
		return await current.action(data, modop, self);
	}
}

class Command {
	static ALL = 2;
	static ATLEAST = 1;
	static OPTIONAL = 0;

	constructor(obj = {}) {
		this.name = obj.name;
		this.short = obj.short;

		this.options = obj.options ?? {};
		this.options.kwargs = this.#flagMapper(obj.options?.kwargs);
		this.options.args = this.#flagMapper(obj.options?.args);

		this.default = obj.default ?? false;
		this.usage = obj.usage;
		this.description = obj.description;
		this.action = obj.action.bind(this);
	}

	#flagMapper(flags = []) {
		const res = {};
		res.l2s = flags.reduce((prev, curr) => {
			prev[curr[0]] = curr[1];
			return prev;
		}, {});
		res.s2l = flags.reduce((prev, curr) => {
			prev[curr[1]] = curr[0];
			return prev;
		}, {});
		res.long = flags.map((ele) => ele[0]);
		res.short = flags.map((ele) => ele[1]);

		return res;
	}
}

module.exports = { CommandHandler, Command };

const str = require("str-temp");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

class File {
	static ROOT = process.cwd();
	static #STREAM = "{~ROOT~}/stream";
	static #TN = "{~STREAM~}/tn";
	static #JSON_PATH = "{~STREAM~}/details";
	static #DATA_FILE = "{~JSON_PATH~}/data.json";
	static #TOKENS_FILE = "{~JSON_PATH~}/tokens.json";
	static #CONFIG_FILE = "{~JSON_PATH~}/config.json";

	static get STREAM() {
		return path.normalize(str(this.#STREAM, this.ROOT));
	}
	static get TN() {
		return path.normalize(str(this.#TN, this.STREAM));
	}
	static get JSON_PATH() {
		return path.normalize(str(this.#JSON_PATH, this.STREAM));
	}
	static get DATA_FILE() {
		return path.normalize(str(this.#DATA_FILE, this.JSON_PATH));
	}
	static get TOKENS_FILE() {
		return path.normalize(str(this.#TOKENS_FILE, this.JSON_PATH));
	}
	static get CONFIG_FILE() {
		return path.normalize(str(this.#CONFIG_FILE, this.JSON_PATH));
	}
}

class Configuration {
	static #options = {
		PORT: "port",
		IGNORE_FILES: "ignore_files",
		VIDEO_EXT: "video_ext",
		AUDIO_EXT: "audio_ext",
		IMAGE_EXT: "image_ext",
		TN: "tn",
	};
	static #default = {
		[Configuration._options.PORT]: parseInt(
			process.env.PORT ?? 4769
		),
		[Configuration._options.IGNORE_FILES]: ["stream"],
		[Configuration._options.VIDEO_EXT]: [
			"mp4",
			"mkv",
			"m4v",
			"avi",
			"vtt",
		],
		[Configuration._options.AUDIO_EXT]: [
			"mp3",
			"avi",
			"wav",
			"flac",
		],
		[Configuration._options.IMAGE_EXT]: [
			"jpg",
			"jpeg",
			"png",
			"webp",
		],
		[Configuration._options.TN]: true,
	};
	static #saved = {};

	static get _options() {
		return { ...this.#options };
	}

	static get _default() {
		return { ...this.#default };
	}

	static get _saved() {
		if (Object.keys(this.#saved).length === 0) {
			try {
				fs.accessSync(File.CONFIG_FILE);
				this.#saved = JSON.parse(
					fs.readFileSync(File.CONFIG_FILE)
				);
			} catch (e) {}
			if (Object.keys(this.#saved).length === 0) {
				this.#saved = { ...this.#default };
			}
		}
		return this.#saved;
	}

	static reset() {
		this.#saved = this.#default;
	}

	static saveConfig() {
		fs.writeFileSync(File.CONFIG_FILE, JSON.stringify(this.#saved));
	}
}

module.exports = {
	File,
	Configuration,
};

const express = require("express");
const app = express();

var cookieParser = require("cookie-parser");
app.use(cookieParser());

const script = require("./script/script.js");

const path = require("path");
const fs = require("fs");
const morgan = require("morgan");

//const dotenv = require("dotenv").config({ path: path.join(__dirname + "/.env") });
//const expand = require("dotenv-expand");

//expand(dotenv);

const frontend = path.join(__dirname, process.env.FRONTEND);

app.set("view engine", "ejs");
app.set("views", path.join(frontend, "/html"));

app.use(morgan("short"));

app.use((req, res, next) => {
	//res.set("Cache-Control", "public, max-age=86400");
	next();
});

app.use(express.static(frontend));

var videoDetails = undefined;

app.get("/", (req, res) => {
	if (videoDetails) res.cookie("path", "/").render("index", { data: videoDetails });
	else {
		fs.readFile(process.env.JSON_FILE, (err, data) => {
			if (err) throw err;

			var result = JSON.parse(data);
			videoDetails = result;

			res.cookie("path", "/").render("index", { data: result });
		});
	}
});

app.get("/video/:video", (req, res) => {
	const filePath = path.join(process.env.ROOT, req.params.video) + ".mp4";
	const fileSize = fs.statSync(filePath).size;

	const range = req.headers.range;

	if (range) {
		const parts = range.replace(/bytes=/, "").split("-");
		const start = parseInt(parts[0], 10);
		const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

		if (start >= fileSize) {
			res.status(416).send("Requested range not satisfiable\n" + start + " >= " + fileSize);
			return;
		}

		const chunksize = end - start + 1;
		const file = fs.createReadStream(filePath, { start, end });
		const head = {
			"Content-Range": `bytes ${start}-${end}/${fileSize}`,
			"Accept-Ranges": "bytes",
			"Content-Length": chunksize,
			"Content-Type": "video/mp4"
		};

		res.writeHead(206, head);
		file.pipe(res);
	} else {
		const head = {
			"Content-Length": fileSize,
			"Content-Type": "video/mp4"
		};
		res.writeHead(200, head);
		fs.createReadStream(filePath).pipe(res);
	}
});

app.get("/tn/:tn", (req, res) => {
	fs.readdir(process.env.TN, (err, data) => {
		if (err) res.status(500).send(err);

		if (data.includes(req.params.tn))
			res.sendFile(path.join(process.env.TN, "/" + req.params.tn));
		else res.status(404).send("INCORRECT id");
	});
});

app.post("/folder/:folder", (req, res) => {
	const pathReq = path.join(req.cookies.path, req.params.folder).trim();

	const pathArr = pathReq.split("\\");

	console.log(pathArr);

	var currFolder = videoDetails;

	for (var ix = 1; ix < pathArr.length; ix++) {
		const fileObj = currFolder.find(e => e.title === pathArr[ix]);

		if (!fileObj) res.status(404).send("Wrong Path!!!");

		currFolder = fileObj.files;
	}

	console.log(currFolder);

	res.render("index", { data: currFolder });
});

const PORT = process.env.PORT || 4769;

const updateAndListen = async function() {
	await script.updateDetails();
	console.log("Listening to PORT => " + PORT);
};

app.listen(PORT, updateAndListen);
